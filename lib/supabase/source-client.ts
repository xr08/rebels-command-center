import { createClient } from '@supabase/supabase-js'

export const sourceSupabase = createClient(
  process.env.NEXT_PUBLIC_SOURCE_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SOURCE_SUPABASE_ANON_KEY!
)
