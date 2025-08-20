'use client';

import { useLocations } from '@/hooks/useLocations';
import { Sun, Zap } from 'lucide-react';
import { formatPower } from '@/lib/utils';
import { ProductionSummaryWidget } from '@/components/dashboard/ProductionSummaryWidget';
import { formatProduction } from '@/lib/utils/pv-production';
import { useEffect } from 'react';
import { useState } from 'react';
import type { LocationProduction, ProductionSummaryResponse } from '@/types';

export default function DashboardPage() {
  const { data: locations = [], isLoading: locationsLoading } = useLocations();

  const [locationProductions, setLocationProductions] = useState<
    LocationProduction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductionData = async () => {
      if (locationsLoading || locations.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Prepare location IDs for API call
        const locationIds = locations.map((loc) => loc.id).join(',');

        const response = await fetch(
          `/api/production-summary?locationIds=${locationIds}`
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data: ProductionSummaryResponse = await response.json();

        if (!data.success) {
          throw new Error('API returned error response');
        }

        setLocationProductions(data.data);
      } catch (err) {
        console.error('Failed to fetch production summary:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductionData();
  }, [locationsLoading, locations]);

  // Calculate summary statistics
  const totalPower = locations.reduce((sum, loc) => sum + loc.pv_power_kwp, 0);
  const totalCurrentProduction = locationProductions.reduce(
    (sum, loc) => sum + loc.currentProduction,
    0
  );
  const totalCurrentConsumption = locationProductions.reduce(
    (sum, loc) => sum + loc.currentConsumption,
    0
  );
  const averageInsolation =
    locationProductions.length > 0
      ? locationProductions.reduce(
          (sum, loc) => sum + loc.insolationPercentage,
          0
        ) / locationProductions.length
      : 0;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Panel główny</h1>
        <p className="text-gray-400 mt-2">
          Witaj w GridSync - zarządzaj swoją energią słoneczną
        </p>
      </div> */}

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-amber-900 rounded-lg">
              <Sun className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">
                Aktualne nasłonecznienie
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {averageInsolation.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-900 rounded-lg">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">
                Maksymalna moc instalacji
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {formatPower(totalPower)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-900 rounded-lg">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">
                Aktualna moc instalacji
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {formatProduction(totalCurrentProduction)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-red-900 rounded-lg">
              <Zap className="h-6 w-6 text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">
                Aktualne zużycie energii
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {formatProduction(totalCurrentConsumption, 'kWh')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Summary Widget */}
      {locations.length > 0 && (
        <div className="mb-8">
          <ProductionSummaryWidget />
        </div>
      )}
    </div>
  );
}
