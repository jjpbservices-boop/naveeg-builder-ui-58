'use server'
import 'server-only'
import { cookies } from 'next/headers'
import { makeSupabaseServer } from '@naveeg/lib/supabase/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function getSupabaseServer() {
  return makeSupabaseServer(SUPABASE_URL, SUPABASE_ANON_KEY, cookies())
}
