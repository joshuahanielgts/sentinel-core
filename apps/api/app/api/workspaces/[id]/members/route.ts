import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'
import { z } from 'zod'

const AddMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member']),
})

const RemoveMemberSchema = z.object({
  user_id: z.string().uuid(),
})

export const GET = withAuth(async (_req, user, params) => {
  try {
    const workspaceId = params.id

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: members, error } = await supabaseAdmin
      .from('workspace_members')
      .select(`
        id,
        user_id,
        role,
        created_at,
        profiles:user_id (full_name, avatar_url)
      `)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: members })
  } catch (error) {
    return errorResponse(error)
  }
})

export const POST = withAuth(async (req, user, params) => {
  try {
    const workspaceId = params.id

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = AddMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { email, role } = parsed.data

    const { data: userData } = await supabaseAdmin.auth.admin.listUsers()
    const targetUser = userData?.users?.find((u) => u.email === email)

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: existingMember } = await supabaseAdmin
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUser.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member' }, { status: 400 })
    }

    const { data: newMember, error } = await supabaseAdmin
      .from('workspace_members')
      .insert({
        workspace_id: workspaceId,
        user_id: targetUser.id,
        role,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data: newMember }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
})

export const DELETE = withAuth(async (req, user, params) => {
  try {
    const workspaceId = params.id

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single()

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = RemoveMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { user_id: targetUserId } = parsed.data

    const { data: targetMember } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUserId)
      .single()

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    if (targetMember.role === 'owner') {
      const { data: owners } = await supabaseAdmin
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('role', 'owner')

      if (owners && owners.length <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last owner' },
          { status: 400 }
        )
      }
    }

    const { error } = await supabaseAdmin
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', targetUserId)

    if (error) throw error

    return NextResponse.json({ data: { success: true } })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
