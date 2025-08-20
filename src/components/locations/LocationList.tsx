'use client';

import { useState } from 'react';
import {
  MapPin,
  Edit,
  Trash2,
  Plus,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocationForm } from './LocationForm';
import { LocationProductionCard } from './LocationProductionCard';
import { useLocations } from '@/hooks/useLocations';
import type { UserLocation } from '@/types';
import type { CreateLocationSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/utils';
import { SYSTEM_LOSSES } from '@/types';

interface LocationListProps {
  locations: UserLocation[];
}

export function LocationList({ locations }: LocationListProps) {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<UserLocation | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createLocation, updateLocation, deleteLocation } = useLocations();

  const handleAddLocation = async (data: CreateLocationSchema) => {
    setIsLoading(true);
    setError(null);

    try {
      await createLocation(data);
      setIsAddDialogOpen(false);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = async (data: CreateLocationSchema) => {
    if (!editingLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateLocation(editingLocation.id, data);
      setEditingLocation(null);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (location: UserLocation) => {
    if (
      !confirm(`Czy na pewno chcesz usunąć lokalizację "${location.name}"?`)
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await deleteLocation(location.id);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  if (locations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-12 max-w-md mx-auto shadow-lg">
          <div className="mb-6">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto" />
          </div>

          <h3 className="text-xl font-semibold text-gray-100 mb-3">
            Brak lokalizacji
          </h3>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Dodaj pierwszą lokalizację, aby rozpocząć zarządzanie energią z
            instalacji fotowoltaicznej
          </p>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
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
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="bg-red-950/50 border border-red-500/20 rounded-md p-3 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">
          Lokalizacje ({locations.length})
        </h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
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

      <div className="grid gap-8">
        {locations.map((location) => (
          <div key={location.id} className="group">
            {/* Main card */}
            <div className="bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-gray-600 transition-all duration-300">
              {/* Card header with status badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gray-800">
                    <MapPin className="h-5 w-5 text-blue-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xl font-bold text-gray-100">
                        {location.name}
                      </h3>
                      <p className="text-xl text-gray-300 font-medium">
                        {location.city}
                      </p>
                      <div className="flex items-center gap-4">
                        {location.system_losses &&
                          location.system_losses !==
                            Math.round(SYSTEM_LOSSES * 100) && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-amber-900 text-amber-300 border border-amber-700 rounded-full">
                                Niestandardowa sprawność:{' '}
                                {location.system_losses}%
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/locations/${location.id}/consumption`
                      )
                    }
                    disabled={isLoading}
                    title="Zarządzaj profilem zużycia energii"
                    className="bg-blue-900 border-blue-700 text-blue-300 hover:bg-blue-800 hover:border-blue-600 transition-all duration-200"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>

                  <Dialog
                    open={editingLocation?.id === location.id}
                    onOpenChange={(open) => {
                      if (!open) setEditingLocation(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingLocation(location)}
                        disabled={isLoading}
                        className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
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
                          mwe_code: location.mwe_code,
                          user_id: location.user_id,
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
                    className="bg-red-900 border-red-700 text-red-300 hover:bg-red-800 hover:border-red-600 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Production card section */}
              <div className="mt-6">
                <LocationProductionCard location={location} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
