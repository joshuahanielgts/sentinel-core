import { z } from 'zod'

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20, 'SUPABASE_ANON_KEY looks too short — use the anon key from Supabase Dashboard > Settings > API'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20, 'SUPABASE_SERVICE_ROLE_KEY looks too short — use the service_role key from Supabase Dashboard > Settings > API')
    .refine((key) => !key.includes('PASTE_YOUR'), { message: 'Replace the placeholder with your actual service_role key from Supabase Dashboard > Settings > API' }),
  GEMINI_API_KEY: z.string().min(1),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
})

function validateEnv() {
  const parsed = envSchema.safeParse(process.env)
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
