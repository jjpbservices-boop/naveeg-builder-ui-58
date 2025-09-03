import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabaseBrowser = () =>
  createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });

/** Server-side helper is optional; keep tiny to avoid Next-specific imports */
export const supabaseClient = supabaseBrowser;

/** Legacy export for backward compatibility */
export const makeSupabaseBrowser = (url: string, anonKey: string) => {
  return createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
};