'use client';

import { useState, useEffect } from 'react';
import { Zap, Sun } from 'lucide-react';
import { getInsolationData } from '@/lib/supabase/queries';
import {
  calculatePVProduction,
  formatProduction,
  getProductionStatus,
} from '@/lib/utils/pv-production';
import type { UserLocation, InsolationData } from '@/types';
import { APP_TIMEZONE } from '@/types';
import { toZonedTime } from 'date-fns-tz';

interface LocationProductionCardProps {
  location: UserLocation;
  className?: string;
}

export function LocationProductionCard({
  location,
  className = '',
}: LocationProductionCardProps) {
  const [currentProduction, setCurrentProduction] = useState<number>(0);
  const [insolationPercentage, setInsolationPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentProduction = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const now = new Date();
        const warsawTime = toZonedTime(now, APP_TIMEZONE);
        const currentDate = warsawTime.toISOString().split('T')[0];
        const currentHour = warsawTime.getHours();

        const insolationData = await getInsolationData(
          location.city,
          currentDate
        );
        const currentHourData = insolationData.find(
          (data: InsolationData) => data.hour === currentHour
        );

        if (currentHourData) {
          const insolation = currentHourData.insolation_percentage;
          const systemLossesDecimal = location.system_losses
            ? location.system_losses / 100
            : undefined;
          const production = calculatePVProduction(
            location.pv_power_kwp,
            insolation,
            systemLossesDecimal
          );

          setInsolationPercentage(insolation);
          setCurrentProduction(production);
        } else {
          setInsolationPercentage(0);
          setCurrentProduction(0);
        }
      } catch (err) {
        console.error('Failed to fetch production data:', err);
        setError('Nie udało się pobrać danych produkcji');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentProduction();

    // Refresh data every 5 minutes
    const interval = setInterval(fetchCurrentProduction, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [location.city, location.pv_power_kwp, location.system_losses]);

  const maxPotentialProduction = location.pv_power_kwp; // Maximum possible production
  const productionStatus = getProductionStatus(
    currentProduction,
    maxPotentialProduction
  );

  if (isLoading) {
    return (
      <div
        className={`bg-gray-800 border border-gray-600 rounded-lg p-4 ${className}`}
      >
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-700 rounded-lg mr-3"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-3 bg-gray-700 rounded w-2/3 mb-3"></div>
          <div className="h-2 bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-950 border border-red-700 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center">
          <div className="p-2 bg-red-900 rounded-lg border border-red-700">
            <Zap className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-red-400 text-sm ml-3 font-medium">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div>
        {/* Production efficiency bar */}
        <div className="mb-4">
          <div className="flex justify-start gap-1 text-xs text-gray-400 mb-2">
            <span className="font-medium">Wydajność instalacji:</span>
            <span className="font-bold">
              {productionStatus.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-lg h-6 overflow-hidden">
            <div
              className={`h-6 rounded-lg transition-all duration-500 ease-out ${
                productionStatus.status === 'excellent'
                  ? 'bg-emerald-500'
                  : productionStatus.status === 'good'
                    ? 'bg-blue-500'
                    : productionStatus.status === 'fair'
                      ? 'bg-amber-500'
                      : productionStatus.status === 'poor'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
              }`}
              style={{
                width: `${Math.min(productionStatus.percentage, 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg">
            <Zap className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-gray-400 block">
                Maksymalna moc instalacji
              </span>
              <span className="text-gray-200 font-semibold">
                {formatProduction(location.pv_power_kwp)}p
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg">
            <Zap className="h-4 w-4 text-emerald-400" />
            <div>
              <span className="text-gray-400 block">
                Aktualna moc instalacji
              </span>
              <span className={`font-semibold`}>
                {formatProduction(currentProduction)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg">
            <Sun className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-gray-400 block">
                Aktualne nasłonecznienie
              </span>
              <span className={`font-semibold `}>
                {insolationPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
