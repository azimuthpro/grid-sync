import useSWR from 'swr'
import type { UserLocation } from '@/types'
import type { CreateLocationSchema } from '@/lib/schemas'

interface LocationsResponse {
  data?: UserLocation[]
  error: Error | null
  isLoading: boolean
  mutate: () => void
}

interface LocationResponse {
  data?: UserLocation
  error: Error | null
  isLoading: boolean
  mutate: () => void
}

interface LocationMutations {
  createLocation: (data: CreateLocationSchema) => Promise<UserLocation>
  updateLocation: (id: string, data: Partial<UserLocation>) => Promise<UserLocation>
  deleteLocation: (id: string) => Promise<void>
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
    throw new Error(error.error || 'Failed to fetch')
  }
  
  return response.json()
}

export function useLocations(): LocationsResponse & LocationMutations {
  const { data, error, isLoading, mutate } = useSWR<UserLocation[]>(
    '/api/locations',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  const createLocation = async (locationData: CreateLocationSchema): Promise<UserLocation> => {
    const response = await fetch('/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(locationData),
    })

    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create location' }))
      throw new Error(error.error || 'Failed to create location')
    }

    const newLocation = await response.json()

    // Optimistic update
    mutate((currentData) => {
      if (!currentData) return [newLocation]
      return [newLocation, ...currentData]
    }, false)

    return newLocation
  }

  const updateLocation = async (id: string, updates: Partial<UserLocation>): Promise<UserLocation> => {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })

    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update location' }))
      throw new Error(error.error || 'Failed to update location')
    }

    const updatedLocation = await response.json()

    // Optimistic update
    mutate((currentData) => {
      if (!currentData) return [updatedLocation]
      
      return currentData.map(loc => {
        if (loc.id === id) {
          return updatedLocation
        }
        return loc
      })
    }, false)

    return updatedLocation
  }

  const deleteLocation = async (id: string): Promise<void> => {
    const response = await fetch(`/api/locations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (response.status === 401) {
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete location' }))
      throw new Error(error.error || 'Failed to delete location')
    }

    // Optimistic update
    mutate((currentData) => {
      if (!currentData) return []
      return currentData.filter(loc => loc.id !== id)
    }, false)
  }

  return {
    data,
    error,
    isLoading,
    mutate,
    createLocation,
    updateLocation,
    deleteLocation,
  }
}

export function useLocation(id: string | null): LocationResponse {
  const { data, error, isLoading, mutate } = useSWR<UserLocation>(
    id ? `/api/locations/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 seconds
    }
  )

  return {
    data,
    error,
    isLoading,
    mutate,
  }
}