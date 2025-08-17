import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateLocationSchema } from '@/lib/schemas'
import { Env } from '@/lib/Env.mjs'

function getSupabaseUrl() {
  const url = Env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_URL')
  }
  return url
}

function getSupabaseAnonKey() {
  const key = Env.SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return key
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The setAll method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching locations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch locations' }, 
        { status: 500 }
      )
    }

    // Convert system_losses from decimal to percentage for frontend
    const locationsWithPercentages = (data || []).map(location => ({
      ...location,
      system_losses: location.system_losses ? location.system_losses * 100 : undefined
    }))

    return NextResponse.json(locationsWithPercentages)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const body: CreateLocationSchema = await request.json()
    
    const locationData = {
      ...body,
      system_losses: body.system_losses ? body.system_losses / 100 : undefined,
      user_id: user.id
    }


    const { data, error } = await supabase
      .from('user_locations')
      .insert(locationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating location:', error)
      return NextResponse.json(
        { error: 'Failed to create location' }, 
        { status: 500 }
      )
    }

    // Convert system_losses from decimal to percentage for frontend
    const locationWithPercentage = {
      ...data,
      system_losses: data.system_losses ? data.system_losses * 100 : undefined
    }

    return NextResponse.json(locationWithPercentage, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}