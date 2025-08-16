'use client'

import { useState } from 'react'
import { MapPin, Edit, Trash2, Star, Plus, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LocationForm } from './LocationForm'
import { useLocations } from '@/hooks/useLocations'
import type { UserLocation } from '@/types'
import type { CreateLocationSchema } from '@/lib/schemas'
import { formatPower, getErrorMessage } from '@/lib/utils'

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

  const handleSetPrimary = async (location: UserLocation) => {
    if (location.is_primary) return

    setIsLoading(true)
    setError(null)

    try {
      await updateLocation(location.id, { is_primary: true })
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

      <div className="grid gap-4">
        {locations.map((location) => (
          <div
            key={location.id}
            className={`p-6 bg-gray-900 border rounded-lg shadow-sm ${
              location.is_primary ? 'border-blue-500/50 bg-blue-950/30' : 'border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${
                  location.is_primary ? 'bg-blue-950/50 ring-1 ring-blue-500/20' : 'bg-gray-800'
                }`}>
                  <MapPin className={`h-5 w-5 ${
                    location.is_primary ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-100">{location.name}</h3>
                    {location.is_primary && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-950/50 text-blue-400 ring-1 ring-blue-500/20">
                        <Star className="h-3 w-3 mr-1" />
                        Główna
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300">{location.city}</p>
                  <p className="text-sm text-gray-400">{formatPower(location.pv_power_kwp)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {!location.is_primary && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(location)}
                    disabled={isLoading}
                    title="Ustaw jako główną"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                
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
                        is_primary: location.is_primary,
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
        ))}
      </div>
    </div>
  )
}