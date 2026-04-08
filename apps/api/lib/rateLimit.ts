/**
 * In-memory token-bucket rate limiter.
 *
 * WARNING: On Vercel serverless, each cold start resets this store.
 * For production, replace with Upstash Redis or Vercel Edge rate limiting.
 * This implementation is kept for local development and as a best-effort
 * defense on warm instances.
 */
import { NextResponse } from 'next/server'

interface RateLimitEntry {
  tokens: number
  lastRefill: number
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now - entry.lastRefill > 120_000) {
      store.delete(key)
    }
  }
}

export interface RateLimitConfig {
  maxTokens: number
  refillRate: number
  refillIntervalMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 10,
  refillRate: 1,
  refillIntervalMs: 1000,
}

export function checkRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; retryAfterMs: number } {
  cleanup()
  const key = `${userId}:${action}`
  const now = Date.now()

  let entry = store.get(key)
  if (!entry) {
    entry = { tokens: config.maxTokens, lastRefill: now }
    store.set(key, entry)
  }

  const elapsed = now - entry.lastRefill
  const refills = Math.floor(elapsed / config.refillIntervalMs)
  if (refills > 0) {
    entry.tokens = Math.min(config.maxTokens, entry.tokens + refills * config.refillRate)
    entry.lastRefill = now
  }

  if (entry.tokens < 1) {
    const retryAfterMs = config.refillIntervalMs - (now - entry.lastRefill)
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) }
  }

  entry.tokens -= 1
  return { allowed: true, retryAfterMs: 0 }
}

export function rateLimitResponse(retryAfterMs: number): NextResponse {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
    }
  )
}
