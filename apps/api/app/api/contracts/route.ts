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

    const { data: contracts, error } = await supabaseAdmin
      .from('contracts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data: contracts })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
