import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from './env'

export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)
