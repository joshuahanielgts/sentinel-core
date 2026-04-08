import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'

export const GET = withAuth(async (_req, user, params) => {
  try {
    const contractId = params.id

    const { data: contract, error: fetchError } = await supabaseAdmin
      .from('contracts')
      .select('workspace_id')
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

    const { data: clauses, error } = await supabaseAdmin
      .from('contract_clauses')
      .select('*')
      .eq('contract_id', contractId)
      .order('position', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: clauses })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
