'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getUserLocations } from '@/lib/supabase/queries'
import { LocationList } from '@/components/locations/LocationList'
import type { UserLocation } from '@/types'
import { getErrorMessage } from '@/lib/utils'

export default function LocationsPage() {
  const [locations, setLocations] = useState<UserLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Użytkownik nie jest zalogowany')
          return
        }

        const userLocations = await getUserLocations(user.id)
        setLocations(userLocations)
      } catch (error) {
        setError(getErrorMessage(error))
      } finally {
        setLoading(false)
      }
    }

    loadLocations()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lokalizacje</h1>
        <p className="text-gray-600 mt-2">
          Zarządzaj swoimi instalacjami fotowoltaicznymi
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <LocationList
        locations={locations}
        onLocationsChange={setLocations}
      />
    </div>
  )
}