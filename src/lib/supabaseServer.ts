import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VERCEL_ENV_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VERCEL_ENV_KEY

export const supabaseServer = createClient(supabaseUrl!, supabaseKey!)
