import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { UserLocation } from '@/types'
import { Env } from '@/lib/Env.mjs'

function getSupabaseUrl() {
  const url = Env.SUPABASE_URL
  if (!url) {
    throw new Error('Missing Env.SUPABASE_URL')
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

    const { data, error } = await supabase
      .from('user_locations')
      .select('*')
      .eq('id', locationId)
      .single()

    if (error) {
      console.error('Error fetching location:', error)
      return NextResponse.json(
        { error: 'Failed to fetch location' }, 
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
    const body: Partial<UserLocation> = await request.json()

    // Verify ownership
    const isOwner = await verifyLocationOwnership(supabase, locationId, user.id)
    if (!isOwner) {
      return NextResponse.json(
        { error: 'Location not found or access denied' }, 
        { status: 404 }
      )
    }

    // If this is being set as primary, unset other primary locations
    if (body.is_primary) {
      await supabase
        .from('user_locations')
        .update({ is_primary: false })
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .neq('id', locationId)
    }

    const { data, error } = await supabase
      .from('user_locations')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', locationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating location:', error)
      return NextResponse.json(
        { error: 'Failed to update location' }, 
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

    const { error } = await supabase
      .from('user_locations')
      .delete()
      .eq('id', locationId)

    if (error) {
      console.error('Error deleting location:', error)
      return NextResponse.json(
        { error: 'Failed to delete location' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}