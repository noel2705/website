import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VERCEL_ENV_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VERCEL_ENV_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL oder SUPABASE_SERVICE_ROLE_KEY ist nicht gesetzt!");
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
