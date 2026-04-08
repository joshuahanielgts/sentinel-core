import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'

export const GET = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = searchParams.get('workspace_id')

    if (!workspaceId) {
      return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 })
    }

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: contracts, error: contractsError } = await supabaseAdmin
      .from('contracts')
      .select('id, status, risk_score')
      .eq('workspace_id', workspaceId)

    if (contractsError) throw contractsError

    const totalContracts = contracts?.length ?? 0
    const pendingAnalysis = contracts?.filter(
      (c) => c.status === 'pending' || c.status === 'uploaded'
    ).length ?? 0

    const contractsByRisk = { low: 0, medium: 0, high: 0, critical: 0 }
    for (const c of contracts ?? []) {
      if (c.risk_score === null) continue
      if (c.risk_score <= 25) contractsByRisk.low++
      else if (c.risk_score <= 50) contractsByRisk.medium++
      else if (c.risk_score <= 75) contractsByRisk.high++
      else contractsByRisk.critical++
    }

    const { data: recentClauses, error: clausesError } = await supabaseAdmin
      .from('contract_clauses')
      .select(`
        id,
        category,
        risk_level,
        rationale,
        contracts:contract_id (name)
      `)
      .eq('workspace_id', workspaceId)
      .in('risk_level', ['high', 'critical'])
      .order('created_at', { ascending: false })
      .limit(10)

    if (clausesError) throw clausesError

    const recentHighRiskClauses = (recentClauses ?? []).map((clause) => ({
      id: clause.id,
      contract_name: (clause.contracts as unknown as { name: string })?.name ?? 'Unknown',
      category: clause.category,
      risk_level: clause.risk_level,
      rationale: clause.rationale,
    }))

    return NextResponse.json({
      data: {
        total_contracts: totalContracts,
        contracts_by_risk: contractsByRisk,
        pending_analysis: pendingAnalysis,
        recent_high_risk_clauses: recentHighRiskClauses,
      },
    })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
