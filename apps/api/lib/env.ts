import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20, 'SUPABASE_ANON_KEY looks too short — use the anon key from Supabase Dashboard > Settings > API'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'SUPABASE_SERVICE_ROLE_KEY looks too short — use the service_role key from Supabase Dashboard > Settings > API')
    .refine((key) => !key.includes('PASTE_YOUR'), { message: 'Replace the placeholder with your actual service_role key from Supabase Dashboard > Settings > API' }),
  GEMINI_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url(),
})

/** Used only during `next build` when env vars are not injected yet (e.g. Vercel before secrets are added). Runtime always uses real `process.env`. */
const BUILD_PLACEHOLDER_ENV: Record<string, string> = {
  SUPABASE_URL: 'https://placeholder-build.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDB9.buildplaceholder',
  SUPABASE_SERVICE_ROLE_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTYwMDAwMDAwMH0.buildplaceholder',
  GEMINI_API_KEY: 'build-placeholder-gemini-key',
  FRONTEND_URL: 'https://placeholder-build.example.com',
}

function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build'
}

function validateEnv() {
  const raw = isNextProductionBuild()
    ? { ...BUILD_PLACEHOLDER_ENV, ...process.env }
    : process.env
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors
    console.error('\n=== ENVIRONMENT VARIABLE ERRORS ===')
    for (const [key, messages] of Object.entries(errors)) {
      console.error(`  ${key}: ${messages?.join(', ')}`)
    }
    console.error('===================================\n')
    throw new Error('Missing or invalid environment variables. Check server logs above.')
  }
  return parsed.data
}

export const env = validateEnv()
