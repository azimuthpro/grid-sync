'use client'

import { useLocations } from '@/hooks/useLocations'
import { LocationList } from '@/components/locations/LocationList'
import { getErrorMessage } from '@/lib/utils'

export default function LocationsPage() {
  const { data: locations = [], error, isLoading } = useLocations()

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Lokalizacje</h1>
        <p className="text-gray-400 mt-2">
          Zarządzaj swoimi instalacjami fotowoltaicznymi
        </p>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-500/20 rounded-md p-4 mb-6">
          <p className="text-red-400">{getErrorMessage(error)}</p>
        </div>
      )}

      <LocationList locations={locations} />
    </div>
  )
}