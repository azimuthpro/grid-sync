import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { Env } from '../Env.mjs'

function getSupabaseUrl() {
  const url = Env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_URL')
  }
  return url
}

function getSupabaseAnonKey() {
  const key = Env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return key
}

export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey()
  )

export const createSupabaseServerClient = (cookieStore: {
  getAll: () => Array<{ name: string; value: string }>
  set: (name: string, value: string, options?: Record<string, unknown>) => void
}) =>
  createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )