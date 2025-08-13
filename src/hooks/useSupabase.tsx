'use client'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { useMemo } from 'react'

export function useSupabase() {
  return useMemo(createSupabaseBrowserClient, [])
}