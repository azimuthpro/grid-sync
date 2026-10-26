'use client';

import { useLocations } from '@/hooks/useLocations';
import { Plug, Sun, Zap } from 'lucide-react';
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
        <h1 className="text-2xl font-semibold tracking-tight text-gray-50">Panel główny</h1>
        <p className="text-gray-400 mt-2">
          Witaj w GridSync - zarządzaj swoją energią słoneczną
        </p>
      </div> */}

      {/* Live readout: one strip, colour = where the energy comes from */}
      <section
        aria-label="Bieżące odczyty"
        className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-8 overflow-hidden rounded-xl border border-gray-800 bg-gray-800"
      >
        {[
          {
            label: 'Nasłonecznienie teraz',
            value: `${averageInsolation.toFixed(0)}%`,
            icon: Sun,
            tone: 'text-amber-400',
          },
          {
            label: 'Moc zainstalowana',
            value: formatPower(totalPower),
            icon: Zap,
            tone: 'text-emerald-400',
          },
          {
            label: 'Produkcja teraz',
            value: formatProduction(totalCurrentProduction),
            icon: Zap,
            tone: 'text-emerald-400',
          },
          {
            label: 'Zużycie teraz',
            value: formatProduction(totalCurrentConsumption, 'kWh'),
            icon: Plug,
            tone: 'text-blue-400',
          },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="bg-gray-900 px-6 py-5">
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <Icon className={`h-4 w-4 ${tone}`} aria-hidden="true" />
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-50 tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* Production Summary Widget */}
      {locations.length > 0 && (
        <div className="mb-8">
          <ProductionSummaryWidget />
        </div>
      )}
    </div>
  );
}
