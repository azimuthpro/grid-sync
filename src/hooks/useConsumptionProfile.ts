import useSWR from 'swr'
import type { ConsumptionProfile } from '@/types'

interface ConsumptionProfileResponse {
  data?: ConsumptionProfile[]
  error: Error | null
  isLoading: boolean
  mutate: () => void
}

interface ConsumptionProfileMutations {
  updateProfiles: (profiles: Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[]) => Promise<ConsumptionProfile[]>
  clearProfiles: () => Promise<void>
}

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include', // Include cookies for auth
  })
  
  if (response.status === 401) {
    // Redirect to login if unauthorized
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch' }))
    throw new Error(error.error || 'Failed to fetch consumption profiles')
  }
  
  return response.json()
}

export function useConsumptionProfile(locationId: string | null): ConsumptionProfileResponse & ConsumptionProfileMutations {
  const { data, error, isLoading, mutate } = useSWR<ConsumptionProfile[]>(
    locationId ? `/api/locations/${locationId}/consumption` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
      revalidateOnReconnect: true,
    }
  )

  const updateProfiles = async (profiles: Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[]): Promise<ConsumptionProfile[]> => {
    if (!locationId) {
      throw new Error('Location ID is required')
    }

    const response = await fetch(`/api/locations/${locationId}/consumption`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        profiles: profiles
      }),
    })

    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update consumption profiles' }))
      throw new Error(error.error || 'Failed to update consumption profiles')
    }

    const updatedProfiles = await response.json()

    // Optimistic update
    mutate(updatedProfiles, false)

    return updatedProfiles
  }

  const clearProfiles = async (): Promise<void> => {
    if (!locationId) {
      throw new Error('Location ID is required')
    }

    const response = await fetch(`/api/locations/${locationId}/consumption`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to clear consumption profiles' }))
      throw new Error(error.error || 'Failed to clear consumption profiles')
    }

    // Optimistic update - clear all data
    mutate([], false)
  }

  return {
    data,
    error,
    isLoading,
    mutate,
    updateProfiles,
    clearProfiles,
  }
}

// Hook for getting consumption profile summary/stats
export function useConsumptionStats(locationId: string | null) {
  const { data: profiles, error, isLoading } = useConsumptionProfile(locationId)

  const stats = useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return {
        weeklyTotal: 0,
        dailyAverage: 0,
        hourlyPeak: 0,
        profileComplete: false,
        completionPercentage: 0
      }
    }

    const weeklyTotal = profiles.reduce((sum, profile) => sum + profile.consumption_kwh, 0)
    const dailyAverage = weeklyTotal / 7
    const hourlyPeak = Math.max(...profiles.map(p => p.consumption_kwh))
    
    // Check completion (should have 168 profiles: 7 days × 24 hours)
    const expectedProfiles = 7 * 24
    const actualProfiles = profiles.length
    const profilesWithValues = profiles.filter(p => p.consumption_kwh > 0).length
    const completionPercentage = (profilesWithValues / expectedProfiles) * 100
    const profileComplete = actualProfiles === expectedProfiles && profilesWithValues > 0

    return {
      weeklyTotal,
      dailyAverage,
      hourlyPeak,
      profileComplete,
      completionPercentage
    }
  }, [profiles])

  return {
    stats,
    error,
    isLoading
  }
}

// Import React for useMemo
import { useMemo } from 'react'