import { createClient } from '@supabase/supabase-js';
export function makeSupabaseBrowser(url = process.env.NEXT_PUBLIC_SUPABASE_URL!, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!) {
  return createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
}
export const supabaseBrowser = makeSupabaseBrowser;
export const supabaseClient = makeSupabaseBrowser;