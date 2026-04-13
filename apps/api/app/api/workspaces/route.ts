import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'
import { z } from 'zod'

const CreateWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

export const GET = withAuth(async (_req, user) => {
  try {
    const { data: memberships, error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', user.id)

    if (memberError) throw memberError

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ data: [] })
    }

    const workspaceIds = memberships.map((m) => m.workspace_id)

    const { data: workspaces, error } = await supabaseAdmin
      .from('workspaces')
      .select('*')
      .in('id', workspaceIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    const workspacesWithRole = workspaces.map((ws) => ({
      ...ws,
      role: memberships.find((m) => m.workspace_id === ws.id)?.role,
    }))

    return NextResponse.json({ data: workspacesWithRole })
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

    const parsed = CreateWorkspaceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') || 'Invalid request body' }, { status: 400 })
    }

    const { name, slug } = parsed.data

    const { data: existing } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
    }

    const { data: workspace, error: wsError } = await supabaseAdmin
      .from('workspaces')
      .insert({ name, slug })
      .select()
      .single()

    if (wsError) throw wsError

    const { error: memberError } = await supabaseAdmin
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      })

    if (memberError) throw memberError

    return NextResponse.json({ data: { ...workspace, role: 'owner' } }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
