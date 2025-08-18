'use client';

import { useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { formatProduction } from '@/lib/utils/pv-production';

interface ProductionSummaryWidgetProps {
  className?: string;
}

interface LocationProduction {
  locationId: string;
  currentProduction: number;
  dailyProduction: number;
  currentConsumption: number;
  dailyConsumption: number;
  insolationPercentage: number;
  selfConsumptionRate: number;
  energyBalance: number;
}

interface ProductionSummaryResponse {
  success: boolean;
  data: LocationProduction[];
  metadata: {
    date: string;
    hour: number;
    totalLocations: number;
  };
}

export function ProductionSummaryWidget({
  className = '',
}: ProductionSummaryWidgetProps) {
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const [locationProductions, setLocationProductions] = useState<
    LocationProduction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductionData = async () => {
      if (locationsLoading || locations.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

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
        setError('Nie udało się pobrać danych produkcji');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductionData();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchProductionData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [locations, locationsLoading]);

  const totalCurrentProduction = locationProductions.reduce(
    (sum, loc) => sum + loc.currentProduction,
    0
  );
  const totalCurrentConsumption = locationProductions.reduce(
    (sum, loc) => sum + loc.currentConsumption,
    0
  );
  const totalEnergyBalance = locationProductions.reduce(
    (sum, loc) => sum + loc.energyBalance,
    0
  );

  // Calculate overall self-consumption rate (how much produced energy is being used locally)
  const selfConsumptionPercentage =
    totalCurrentProduction > 0
      ? Math.min((totalCurrentConsumption / totalCurrentProduction) * 100, 100)
      : 0;

  if (locationsLoading || isLoading) {
    return (
      <div className={`rounded-lg ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className={`rounded-lg ${className}`}>
        <div className="p-6 text-center">
          <Sun className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">
            Brak lokalizacji do monitorowania produkcji
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg ${className}`}>
      {error && (
        <div className="p-4 bg-red-950/50 border-b border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Self-consumption efficiency indicator */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h4 className="text-sm font-medium text-gray-200">
              Autokonsumpcja energii
            </h4>
            <p className="text-xs text-gray-400">
              Wykorzystywanie wyprodukowanej energii na miejscu
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-100">
              {selfConsumptionPercentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-400">
              {totalCurrentConsumption.toFixed(1)} /{' '}
              {totalCurrentProduction.toFixed(1)} kW
            </div>
          </div>
        </div>

        <div className="relative w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out relative ${
              selfConsumptionPercentage >= 90
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                : selfConsumptionPercentage >= 70
                  ? 'bg-gradient-to-r from-blue-600 to-blue-400'
                  : selfConsumptionPercentage >= 50
                    ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                    : selfConsumptionPercentage > 0
                      ? 'bg-gradient-to-r from-red-600 to-red-400'
                      : 'bg-gray-500'
            }`}
            style={{ width: `${Math.min(selfConsumptionPercentage, 100)}%` }}
          >
            {selfConsumptionPercentage > 15 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-semibold text-white drop-shadow">
                  {selfConsumptionPercentage.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center space-x-4">
            {/* Only show energy balance info when production is meaningful (> 0.1 kW) */}
            {totalCurrentProduction > 0.1 ? (
              <div
                className={`text-xs font-medium ${
                  totalEnergyBalance >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {totalEnergyBalance >= 0 ? '↗ Nadwyżka' : '↙ Niedobór'}:{' '}
                {Math.abs(totalEnergyBalance).toFixed(1)} kW
              </div>
            ) : (
              <div className="text-xs font-medium text-gray-400">
                ⚡ Zasilanie z sieci: {totalCurrentConsumption.toFixed(1)} kW
              </div>
            )}
          </div>
          <div
            className={`text-xs px-2 py-1 rounded-full ${
              selfConsumptionPercentage >= 90
                ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                : selfConsumptionPercentage >= 70
                  ? 'bg-blue-950/50 text-blue-400 border border-blue-500/20'
                  : selfConsumptionPercentage >= 50
                    ? 'bg-amber-950/50 text-amber-400 border border-amber-500/20'
                    : 'bg-red-950/50 text-red-400 border border-red-500/20'
            }`}
          >
            {selfConsumptionPercentage >= 90
              ? 'Bardzo efektywne'
              : selfConsumptionPercentage >= 70
                ? 'Efektywne'
                : selfConsumptionPercentage >= 50
                  ? 'Umiarkowane'
                  : 'Wymaga optymalizacji'}
          </div>
        </div>
      </div>

      {/* Location breakdown */}
      {locationProductions.length > 1 && (
        <div>
          <div className="space-y-4">
            {locationProductions.map((locationProd) => {
              const location = locations.find(
                (loc) => loc.id === locationProd.locationId
              );
              if (!location) return null;

              return (
                <div
                  key={locationProd.locationId}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3 bg-blue-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {location.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {location.city} •{' '}
                        {locationProd.insolationPercentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-200">
                      {formatProduction(locationProd.currentProduction)} /{' '}
                      {formatProduction(locationProd.currentConsumption)}
                    </p>
                    <div className="flex items-center justify-end space-x-2">
                      <p className="text-xs text-gray-400">
                        Autokonsumpcja:{' '}
                        {locationProd.selfConsumptionRate.toFixed(0)}%
                      </p>
                      <span className="text-xs">•</span>
                      <p
                        className={`text-xs font-medium ${
                          locationProd.energyBalance > 0
                            ? 'text-emerald-400'
                            : locationProd.energyBalance < 0
                              ? 'text-red-400'
                              : 'text-white'
                        }`}
                      >
                        {locationProd.energyBalance > 0 ? '+' : ''}
                        {locationProd.energyBalance.toFixed(1)} kW
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
