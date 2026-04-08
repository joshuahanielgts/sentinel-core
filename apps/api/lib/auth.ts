import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from './env'

type AuthHandler = (
  req: NextRequest,
  user: User,
  params: Record<string, string>
) => Promise<NextResponse | Response>

export function withAuth(handler: AuthHandler) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204 })
    }

    const token = req.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient<Database>(
      env.SUPABASE_URL,
      env.SUPABASE_ANON_KEY
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const params = await context.params
    return handler(req, user, params)
  }
}
