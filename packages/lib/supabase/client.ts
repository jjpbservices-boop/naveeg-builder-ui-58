import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabaseBrowser = () =>
  createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } });
export const makeSupabaseBrowser = (url: string, anonKey: string) =>
  createClient(url, anonKey, { auth: { persistSession: true, autoRefreshToken: true } });
export const supabaseClient = supabaseBrowser;      // legacy alias