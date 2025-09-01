import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from './database.types'

export type CookieStore = {
  get: (name: string) => { value?: string } | undefined
  set: (name: string, value: string, options?: CookieOptions) => void
}

export function makeSupabaseServer(
  url: string,
  anonKey: string,
  cookieStore: CookieStore
) {
  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get: (name) => cookieStore.get(name)?.value,
      set: (name, value, options) => cookieStore.set(name, value, options),
      remove: (name, options) => cookieStore.set(name, '', { ...options, maxAge: 0 }),
    },
  })
}

export const makeSupabaseService = (url: string, serviceKey: string) => {
  return createServerClient<Database>(url, serviceKey, {
    cookies: {
      get: () => undefined,
      set: () => {},
      remove: () => {},
    },
  })
}
