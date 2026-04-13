import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { analyzeContract } from '@/lib/gemini'
import { errorResponse } from '@/lib/errors'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import type { Json } from '@/types/database'

export const maxDuration = 300

export const POST = withAuth(async (_req, user, params) => {
  try {
    const allowed = await checkRateLimit(user.id, 5)
    if (!allowed) return rateLimitResponse()

    const contractId = params.id

    const { data: contract, error: fetchError } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (fetchError || !contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', contract.workspace_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (contract.status === 'complete') {
      return NextResponse.json(
        { error: 'Contract has already been analyzed' },
        { status: 400 }
      )
    }

    if (contract.status === 'analyzing') {
      return NextResponse.json(
        { error: 'Analysis is already in progress' },
        { status: 400 }
      )
    }

    await supabaseAdmin
      .from('contracts')
      .update({ status: 'analyzing', updated_at: new Date().toISOString() })
      .eq('id', contractId)

    const { data: run, error: runError } = await supabaseAdmin
      .from('analysis_runs')
      .insert({
        contract_id: contractId,
        workspace_id: contract.workspace_id,
        status: 'running',
        model: 'gemini-2.5-pro',
      })
      .select()
      .single()

    if (runError) throw runError

    try {
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('contracts')
        .download(contract.file_path)

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message}`)
      }

      const buffer = new Uint8Array(await fileData.arrayBuffer())

      const supportedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] as const
      type MimeType = typeof supportedTypes[number]
      if (!supportedTypes.includes(contract.mime_type as MimeType)) {
        return NextResponse.json(
          { error: 'Unsupported file type for analysis' },
          { status: 400 }
        )
      }

      const result = await analyzeContract(buffer, contract.mime_type as MimeType)

      const { _meta: meta } = result

      const clauseInserts = result.clauses.map((clause) => ({
        contract_id: contractId,
        workspace_id: contract.workspace_id,
        raw_text: clause.raw_text,
        category: clause.category,
        risk_level: clause.risk_level,
        rationale: clause.rationale,
        position: clause.position,
      }))

      if (clauseInserts.length > 0) {
        const { error: clauseError } = await supabaseAdmin
          .from('contract_clauses')
          .insert(clauseInserts)

        if (clauseError) throw clauseError
      }

      await supabaseAdmin
        .from('contracts')
        .update({
          status: 'complete',
          risk_score: result.risk_score,
          summary: result.summary,
          key_obligations: result.key_obligations as unknown as Json,
          red_flags: result.red_flags as unknown as Json,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId)

      await supabaseAdmin
        .from('analysis_runs')
        .update({
          status: 'complete',
          prompt_tokens: meta.promptTokens,
          completion_tokens: meta.completionTokens,
          total_tokens: meta.totalTokens,
          duration_ms: meta.durationMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)

      return NextResponse.json({
        data: {
          contract_id: contractId,
          risk_score: result.risk_score,
          overall_risk_level: result.overall_risk_level,
          summary: result.summary,
          clauses_count: result.clauses.length,
        },
      })
    } catch (analysisError) {
      const errorMessage = analysisError instanceof Error ? analysisError.message : 'Unknown analysis error'

      await supabaseAdmin
        .from('contracts')
        .update({
          status: 'error',
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contractId)

      await supabaseAdmin
        .from('analysis_runs')
        .update({
          status: 'error',
          error_message: errorMessage,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)

      return NextResponse.json(
        { error: `Analysis failed: ${errorMessage}` },
        { status: 500 }
      )
    }
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
