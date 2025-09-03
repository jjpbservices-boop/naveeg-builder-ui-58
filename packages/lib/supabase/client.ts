import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

export const makeSupabaseBrowser = (url: string, anonKey: string) => {
  return createClient<Database>(url, anonKey)
}
