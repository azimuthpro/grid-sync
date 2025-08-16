import { createSupabaseBrowserClient } from './client'
import type { UserLocation, ConsumptionProfile, InsolationData } from '@/types'
import { getProvinceForCity } from '@/types'

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
  const province = getProvinceForCity(city)
  
  let query = supabase
    .from('insolation_data')
    .select('*')
    .eq('city', city)
    .eq('date', date)
  
  if (province) {
    query = query.eq('province', province)
  }
  
  const { data, error } = await query.order('hour', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getInsolationDataRange(city: string, startDate: string, endDate: string): Promise<InsolationData[]> {
  const supabase = createSupabaseBrowserClient()
  const province = getProvinceForCity(city)
  
  let query = supabase
    .from('insolation_data')
    .select('*')
    .eq('city', city)
    .gte('date', startDate)
    .lte('date', endDate)
  
  if (province) {
    query = query.eq('province', province)
  }
  
  const { data, error } = await query
    .order('date', { ascending: true })
    .order('hour', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getInsolationByProvince(province: string, date?: string): Promise<InsolationData[]> {
  const supabase = createSupabaseBrowserClient()
  
  let query = supabase
    .from('insolation_data')
    .select('*')
    .eq('province', province)
  
  if (date) {
    query = query.eq('date', date)
  }
  
  const { data, error } = await query
    .order('date', { ascending: true })
    .order('hour', { ascending: true })
    .order('city', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getCitiesByProvince(province: string): Promise<string[]> {
  const supabase = createSupabaseBrowserClient()
  
  const { data, error } = await supabase
    .from('insolation_data')
    .select('city')
    .eq('province', province)

  if (error) throw error
  
  // Get unique cities
  const uniqueCities = [...new Set(data?.map(item => item.city) || [])]
  return uniqueCities.sort()
}

export async function getInsolationStatistics(): Promise<{
  totalRecords: number
  uniqueDates: number
  uniqueCities: number
  uniqueProvinces: number
  latestDate: string | null
  dateRange: { start: string | null; end: string | null }
}> {
  const supabase = createSupabaseBrowserClient()
  
  try {
    // Get total records
    const { count: totalRecords } = await supabase
      .from('insolation_data')
      .select('id', { count: 'exact', head: true })

    // Get unique dates
    const { data: dates } = await supabase
      .from('insolation_data')
      .select('date')

    // Get unique cities
    const { data: cities } = await supabase
      .from('insolation_data')
      .select('city')

    // Get unique provinces
    const { data: provinces } = await supabase
      .from('insolation_data')
      .select('province')

    // Get date range
    const { data: latestDateData } = await supabase
      .from('insolation_data')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)

    const { data: oldestDateData } = await supabase
      .from('insolation_data')
      .select('date')
      .order('date', { ascending: true })
      .limit(1)

    const uniqueDates = new Set(dates?.map(d => d.date) || []).size
    const uniqueCities = new Set(cities?.map(c => c.city) || []).size
    const uniqueProvinces = new Set(provinces?.map(p => p.province) || []).size
    const latestDate = latestDateData?.[0]?.date || null
    
    return {
      totalRecords: totalRecords || 0,
      uniqueDates,
      uniqueCities,
      uniqueProvinces,
      latestDate,
      dateRange: {
        start: oldestDateData?.[0]?.date || null,
        end: latestDate
      }
    }
  } catch (error) {
    console.error('Failed to get insolation statistics:', error)
    return {
      totalRecords: 0,
      uniqueDates: 0,
      uniqueCities: 0,
      uniqueProvinces: 0,
      latestDate: null,
      dateRange: { start: null, end: null }
    }
  }
}

export async function getAverageInsolationByHour(city?: string, province?: string, date?: string): Promise<Array<{ hour: number; average: number; count: number }>> {
  const supabase = createSupabaseBrowserClient()
  
  let query = supabase
    .from('insolation_data')
    .select('hour, insolation_percentage')
  
  if (city) {
    query = query.eq('city', city)
  }
  
  if (province) {
    query = query.eq('province', province)
  }
  
  if (date) {
    query = query.eq('date', date)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  
  // Group by hour and calculate averages
  const hourlyData = new Map<number, { sum: number; count: number }>()
  
  data?.forEach(item => {
    const existing = hourlyData.get(item.hour) || { sum: 0, count: 0 }
    existing.sum += item.insolation_percentage
    existing.count += 1
    hourlyData.set(item.hour, existing)
  })
  
  // Convert to array with averages
  const result = Array.from(hourlyData.entries()).map(([hour, { sum, count }]) => ({
    hour,
    average: parseFloat((sum / count).toFixed(2)),
    count
  }))
  
  return result.sort((a, b) => a.hour - b.hour)
}