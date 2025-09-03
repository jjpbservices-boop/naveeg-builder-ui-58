import { createClient } from '@supabase/supabase-js';

export function makeSupabaseServer(url: string, anonKey: string, cookieStore: any) {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
