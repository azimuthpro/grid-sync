'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, MapPin, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsumptionProfileEditor } from '@/components/consumption/ConsumptionProfileEditor';
import { useLocation } from '@/hooks/useLocations';
import { useConsumptionProfile } from '@/hooks/useConsumptionProfile';
import { getErrorMessage } from '@/lib/utils';
import type { ConsumptionProfile } from '@/types';

export default function ConsumptionProfilePage() {
  const params = useParams();
  const router = useRouter();
  const locationId = params.id as string;

  const {
    data: location,
    error: locationError,
    isLoading: locationLoading,
  } = useLocation(locationId);
  const {
    data: profiles,
    error: profilesError,
    isLoading: profilesLoading,
    updateProfiles,
  } = useConsumptionProfile(locationId);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async (
    newProfiles: Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[]
  ) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      await updateProfiles(newProfiles);
      // Success feedback could be added here (e.g., toast notification)
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/locations');
  };

  if (locationLoading || profilesLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-700 rounded w-48"></div>
              <div className="h-4 bg-gray-700 rounded w-32"></div>
            </div>
          </div>
          <div className="h-96 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (locationError) {
    return (
      <div className="p-8">
        <div className="bg-red-950/50 border border-red-500/20 rounded-md p-6">
          <h3 className="text-lg font-medium text-red-400 mb-2">
            Błąd ładowania lokalizacji
          </h3>
          <p className="text-red-300">{getErrorMessage(locationError)}</p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            Powrót do listy lokalizacji
          </Button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-8">
        <div className="bg-gray-800 border border-gray-600 rounded-md p-6">
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Lokalizacja nie została znaleziona
          </h3>
          <p className="text-gray-400">
            Lokalizacja o podanym ID nie istnieje lub nie masz do niej dostępu.
          </p>
          <Button onClick={handleBack} variant="outline" className="mt-4">
            Powrót do listy lokalizacji
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={handleBack}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 border-none"
        >
          <ArrowLeft className="h-4 w-4" />
          Powrót
        </Button>

        <div className="flex items-center ">
          <h1 className="text-2xl font-bold text-gray-100">
            Profil zużycia energii
          </h1>
        </div>
      </div>

      {/* Error handling */}
      {(profilesError || saveError) && (
        <div className="mb-6 bg-red-950/50 border border-red-500/20 rounded-md p-4">
          <p className="text-red-400">
            {saveError || getErrorMessage(profilesError)}
          </p>
        </div>
      )}

      {/* Main content */}
      <ConsumptionProfileEditor
        locationId={locationId}
        locationName={location.name}
        initialProfiles={profiles || []}
        onSave={handleSave}
        isLoading={profilesLoading}
        isSaving={isSaving}
      />
    </div>
  );
}
