import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'
import { z } from 'zod'

const PatchSchema = z.object({
  status: z.enum(['uploaded']).optional(),
})

export const GET = withAuth(async (_req, user, params) => {
  try {
    const contractId = params.id

    const { data: contract, error } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single()

    if (error || !contract) {
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

    return NextResponse.json({ data: contract })
  } catch (error) {
    return errorResponse(error)
  }
})

export const PATCH = withAuth(async (req, user, params) => {
  try {
    const contractId = params.id

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

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

    const updateData: { updated_at: string; status?: string } = {
      updated_at: new Date().toISOString(),
    }
    if (parsed.data.status) {
      updateData.status = parsed.data.status
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ data: updated })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
