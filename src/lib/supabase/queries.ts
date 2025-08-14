import { createSupabaseBrowserClient } from './client'
import type { UserLocation, ConsumptionProfile, InsolationData } from '@/types'

export async function getUserLocations(userId: string): Promise<UserLocation[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_locations')
    .select('*')
    .eq('user_id', userId)
    .order('is_primary', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user locations: ${error.message || 'Unknown database error'}`)
  }
  
  return data || []
}

export async function createUserLocation(location: Omit<UserLocation, 'id' | 'created_at' | 'updated_at'>): Promise<UserLocation> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_locations')
    .insert(location)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUserLocation(id: string, updates: Partial<UserLocation>): Promise<UserLocation> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_locations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteUserLocation(id: string): Promise<void> {
  const supabase = createSupabaseBrowserClient()
  const { error } = await supabase
    .from('user_locations')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getConsumptionProfile(locationId: string): Promise<ConsumptionProfile[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('consumption_profiles')
    .select('*')
    .eq('location_id', locationId)
    .order('day_of_week', { ascending: true })
    .order('hour', { ascending: true })

  if (error) throw error
  return data || []
}

export async function updateConsumptionProfile(
  locationId: string, 
  profiles: Array<{ day_of_week: number; hour: number; consumption_kwh: number }>
): Promise<void> {
  const supabase = createSupabaseBrowserClient()
  // Delete existing profiles
  await supabase
    .from('consumption_profiles')
    .delete()
    .eq('location_id', locationId)

  // Insert new profiles
  const profilesWithId = profiles.map(profile => ({
    ...profile,
    location_id: locationId,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('consumption_profiles')
    .insert(profilesWithId)

  if (error) throw error
}

export async function getInsolationData(city: string, date: string): Promise<InsolationData[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('insolation_data')
    .select('*')
    .eq('city', city)
    .eq('date', date)
    .order('hour', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getInsolationDataRange(city: string, startDate: string, endDate: string): Promise<InsolationData[]> {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('insolation_data')
    .select('*')
    .eq('city', city)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('hour', { ascending: true })

  if (error) throw error
  return data || []
}