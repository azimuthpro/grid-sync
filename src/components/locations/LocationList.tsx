'use client'

import { useState } from 'react'
import { MapPin, Edit, Trash2, Plus, Zap, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LocationForm } from './LocationForm'
import { LocationProductionCard } from './LocationProductionCard'
import { useLocations } from '@/hooks/useLocations'
import type { UserLocation } from '@/types'
import type { CreateLocationSchema } from '@/lib/schemas'
import { formatPower, getErrorMessage } from '@/lib/utils'
import { SYSTEM_LOSSES } from '@/types'

interface LocationListProps {
  locations: UserLocation[]
}

export function LocationList({ locations }: LocationListProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { createLocation, updateLocation, deleteLocation } = useLocations()

  const handleAddLocation = async (data: CreateLocationSchema) => {
    setIsLoading(true)
    setError(null)

    try {
      await createLocation(data)
      setIsAddDialogOpen(false)
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditLocation = async (data: CreateLocationSchema) => {
    if (!editingLocation) return

    setIsLoading(true)
    setError(null)

    try {
      await updateLocation(editingLocation.id, data)
      setEditingLocation(null)
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLocation = async (location: UserLocation) => {
    if (!confirm(`Czy na pewno chcesz usunąć lokalizację "${location.name}"?`)) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await deleteLocation(location.id)
    } catch (error) {
      setError(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }


  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-100 mb-2">Brak lokalizacji</h3>
        <p className="text-gray-400 mb-6">Dodaj pierwszą lokalizację, aby rozpocząć zarządzanie energią</p>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj lokalizację
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dodaj nową lokalizację</DialogTitle>
            </DialogHeader>
            <LocationForm
              onSubmit={handleAddLocation}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={isLoading}
            />
            {error && (
              <div className="bg-red-950/50 border border-red-500/20 rounded-md p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-950/50 border border-red-500/20 rounded-md p-3 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-100">
          Twoje lokalizacje ({locations.length})
        </h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj lokalizację
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Dodaj nową lokalizację</DialogTitle>
            </DialogHeader>
            <LocationForm
              onSubmit={handleAddLocation}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="p-6 bg-gray-900 border border-gray-700 rounded-lg shadow-sm"
          >
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Location info section */}
              <div className="lg:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-gray-800">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-100">{location.name}</h3>
                      </div>
                      <p className="text-gray-300">{location.city}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-400">{formatPower(location.pv_power_kwp)}</p>
                        {location.system_losses && location.system_losses !== Math.round(SYSTEM_LOSSES * 100) && (
                          <div className="group relative">
                            <Settings className="h-3 w-3 text-amber-500" />
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-gray-200 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                              Niestandardowa sprawność: {location.system_losses}%
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/locations/${location.id}/consumption`)}
                      disabled={isLoading}
                      title="Zarządzaj profilem zużycia energii"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                    
                    <Dialog open={editingLocation?.id === location.id} onOpenChange={(open) => {
                      if (!open) setEditingLocation(null)
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingLocation(location)}
                          disabled={isLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edytuj lokalizację</DialogTitle>
                        </DialogHeader>
                        <LocationForm
                          onSubmit={handleEditLocation}
                          onCancel={() => setEditingLocation(null)}
                          initialData={{
                            name: location.name,
                            city: location.city,
                            pv_power_kwp: location.pv_power_kwp,
                            system_losses: location.system_losses,
                            user_id: location.user_id
                          }}
                          isLoading={isLoading}
                        />
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLocation(location)}
                      disabled={isLoading}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Production display section */}
              <div className="lg:col-span-1">
                <LocationProductionCard location={location} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}