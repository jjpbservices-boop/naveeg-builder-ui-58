import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export const makeSupabaseBrowser = (url: string, anonKey: string) => {
  return createBrowserClient<Database>(url, anonKey)
}
