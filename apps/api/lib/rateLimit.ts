import { NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase'

export async function checkRateLimit(
  userId: string,
  limit: number = 20
): Promise<boolean> {
  const window = Math.floor(Date.now() / 3_600_000)
  const { data, error } = await (supabaseAdmin as unknown as {
    rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>
  })
    .rpc('increment_rate_limit', {
      p_user_id: userId,
      p_window: window,
      p_limit: limit,
    })
  if (error) return true
  return data as boolean
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': '60' },
    }
  )
}
