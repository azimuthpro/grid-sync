import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client with service role key for server-side operations
 * This client bypasses Row Level Security (RLS) and should only be used in API routes
 * Never expose the service role key to the client side
 */
export function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration for service client')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}