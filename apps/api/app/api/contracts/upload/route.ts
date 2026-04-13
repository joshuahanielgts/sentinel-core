import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { errorResponse } from '@/lib/errors'
import { z } from 'zod'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.docx'])

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

const UploadSchema = z.object({
  name: z.string().min(1).max(255),
  file_name: z.string().min(1),
  file_size: z.number().int().positive().max(MAX_FILE_SIZE),
  mime_type: z.enum(ALLOWED_MIME_TYPES),
  workspace_id: z.string().uuid(),
})

export const POST = withAuth(async (req, user) => {
  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = UploadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map((issue) => issue.message).join(', ') || 'Invalid request body' }, { status: 400 })
    }

    const { name, file_name, file_size, mime_type, workspace_id } = parsed.data

    const ext = file_name.toLowerCase().slice(file_name.lastIndexOf('.'))
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 })
    }

    const { data: membership } = await supabaseAdmin
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user.id)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: contract, error: contractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        workspace_id,
        uploaded_by: user.id,
        name,
        file_path: '',
        file_size,
        mime_type,
        status: 'pending',
      })
      .select()
      .single()

    if (contractError) throw contractError

    const storagePath = `${workspace_id}/${contract.id}/${file_name}`

    const { data: signedUrl, error: signError } = await supabaseAdmin.storage
      .from('contracts')
      .createSignedUploadUrl(storagePath)

    if (signError) throw signError

    await supabaseAdmin
      .from('contracts')
      .update({ file_path: storagePath })
      .eq('id', contract.id)

    return NextResponse.json(
      {
        data: {
          contract_id: contract.id,
          upload_url: signedUrl.signedUrl,
          upload_path: storagePath,
          token: signedUrl.token,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return errorResponse(error)
  }
})

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
