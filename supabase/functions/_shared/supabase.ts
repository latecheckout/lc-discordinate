import { createClient } from 'jsr:@supabase/supabase-js'
import { Database } from './database.types.ts'

export const supabase = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!,
)
