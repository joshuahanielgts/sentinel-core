import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'
import { z } from 'zod'

const CreateSessionSchema = z.object({
  contract_id: z.string().uuid(),
  title: z.string().max(255).optional(),
})

export const GET = withAuth(async (req, user) => {
  try {
    const { searchParams } = new URL(req.url)
    const contractId = searchParams.get('contract_id')

    if (!contractId) {
      return NextResponse.json({ error: 'contract_id is required' }, { status: 400 })
    }

    const { data: contract } = await supabaseAdmin
      .from('contracts')
      .select('workspace_id')
      .eq('id', contractId)
      .single()

    if (!contract) {
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

    const { data: sessions, error } = await supabaseAdmin
      .from('chat_sessions')
      .select('*')
      .eq('contract_id', contractId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: sessions })
  } catch (error) {
    return errorResponse(error)
  }
})

export const POST = withAuth(async (req, user) => {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = CreateSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { contract_id, title } = parsed.data

    const { data: contract } = await supabaseAdmin
      .from('contracts')
      .select('workspace_id, name')
      .eq('id', contract_id)
      .single()

    if (!contract) {
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

    const { data: session, error } = await supabaseAdmin
      .from('chat_sessions')
      .insert({
        contract_id: contract_id,
        workspace_id: contract.workspace_id,
        user_id: user.id,
        title: title || `Chat about ${contract.name}`,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: session }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
