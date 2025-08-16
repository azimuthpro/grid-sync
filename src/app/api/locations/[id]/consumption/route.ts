import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { batchConsumptionUpdateSchema } from '@/lib/schemas'
import { Env } from '@/lib/Env.mjs'

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

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

async function verifyLocationOwnership(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, locationId: string, userId: string) {
  const { data, error } = await supabase
    .from('user_locations')
    .select('id')
    .eq('id', locationId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return true
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id: locationId } = await params

    // Verify ownership
    const isOwner = await verifyLocationOwnership(supabase, locationId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Location not found or access denied' }, 
        { status: 404 }
      )
    }

    // Get consumption profiles for this location
    const { data, error } = await supabase
      .from('consumption_profiles')
      .select('*')
      .eq('location_id', locationId)
      .order('day_of_week', { ascending: true })
      .order('hour', { ascending: true })

    if (error) {
      console.error('Error fetching consumption profiles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch consumption profiles' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id: locationId } = await params
    const body = await request.json()

    // Verify ownership
    const isOwner = await verifyLocationOwnership(supabase, locationId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Location not found or access denied' }, 
        { status: 404 }
      )
    }

    // Validate request body
    const validationResult = batchConsumptionUpdateSchema.safeParse({
      location_id: locationId,
      profiles: body.profiles || []
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues }, 
        { status: 400 }
      )
    }

    const { profiles } = validationResult.data

    // Start transaction by deleting existing profiles and inserting new ones
    // Delete existing profiles for this location
    const { error: deleteError } = await supabase
      .from('consumption_profiles')
      .delete()
      .eq('location_id', locationId)

    if (deleteError) {
      console.error('Error deleting existing consumption profiles:', deleteError)
      return NextResponse.json(
        { error: 'Failed to update consumption profiles' }, 
        { status: 500 }
      )
    }

    // Insert new profiles with generated IDs
    const profilesWithMetadata = profiles.map(profile => ({
      id: crypto.randomUUID(),
      location_id: locationId,
      day_of_week: profile.day_of_week,
      hour: profile.hour,
      consumption_kwh: profile.consumption_kwh,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data, error: insertError } = await supabase
      .from('consumption_profiles')
      .insert(profilesWithMetadata)
      .select()

    if (insertError) {
      console.error('Error inserting new consumption profiles:', insertError)
      return NextResponse.json(
        { error: 'Failed to update consumption profiles' }, 
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createSupabaseServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { id: locationId } = await params

    // Verify ownership
    const isOwner = await verifyLocationOwnership(supabase, locationId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Location not found or access denied' }, 
        { status: 404 }
      )
    }

    // Delete all consumption profiles for this location
    const { error } = await supabase
      .from('consumption_profiles')
      .delete()
      .eq('location_id', locationId)

    if (error) {
      console.error('Error deleting consumption profiles:', error)
      return NextResponse.json(
        { error: 'Failed to delete consumption profiles' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}