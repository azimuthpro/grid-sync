'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInsolationCities } from '@/hooks/useInsolation';
import { POLISH_PROVINCES } from '@/types';

interface InsolationFiltersProps {
  onFiltersChange: (filters: {
    province?: string;
    city?: string;
    showForecast?: boolean;
  }) => void;
  initialFilters?: {
    province?: string;
    city?: string;
    showForecast?: boolean;
  };
  className?: string;
}

export function InsolationFilters({
  onFiltersChange,
  initialFilters = {},
  className = '',
}: InsolationFiltersProps) {
  const [province, setProvince] = useState(initialFilters.province || 'all');
  const [city, setCity] = useState(initialFilters.city || 'all');
  const [showForecast, setShowForecast] = useState(
    initialFilters.showForecast ?? true
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const hasInitialized = useRef(false);

  const {
    cities,
    fetchCities,
    isLoading: citiesLoading,
  } = useInsolationCities(province);

  useEffect(() => {
    if (province !== 'all') {
      fetchCities();
    }
  }, [province, fetchCities]);

  useEffect(() => {
    // Reset city when province changes
    if (province === 'all') {
      setCity('all');
    } else if (cities.length > 0 && !cities.includes(city)) {
      setCity('all');
    }
  }, [province, cities, city]);

  const applyFilters = useCallback(() => {
    const filters = {
      province: province === 'all' ? undefined : province,
      city: city === 'all' ? undefined : city,
      showForecast,
    };
    onFiltersChange(filters);
  }, [province, city, showForecast, onFiltersChange]);

  // Auto-apply filters with debounce (skip initial mount)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 400); // 400ms debounce for faster response while preventing excessive API calls

    return () => clearTimeout(timeoutId);
  }, [applyFilters]);

  const handleClearFilters = () => {
    setProvince('all');
    setCity('all');
    setShowForecast(true);
    onFiltersChange({});
  };

  const hasActiveFilters =
    province !== 'all' || city !== 'all' || !showForecast;

  return (
    <div className={`bg-gray-900 rounded-lg  ${className}`}>
      <div className="px-4 pt-4 ">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2 ml-2" />
            <h3 className="text-lg font-semibold text-gray-100">Filtry</h3>
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-950/50 text-blue-400 ring-1 ring-blue-500/20">
                Aktywne
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4 mr-1" />
                Wyczyść
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden"
            >
              {isExpanded ? 'Zwiń' : 'Rozwiń'}
            </Button>
          </div>
        </div>
      </div>

      <div className={`px-6 py-4 ${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Province filter */}
          <div>
            <label
              id="filter-province-label"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Województwo
            </label>
            <Select value={province} onValueChange={setProvince}>
              <SelectTrigger aria-labelledby="filter-province-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {POLISH_PROVINCES.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City filter */}
          <div>
            <label
              id="filter-city-label"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Miasto
            </label>
            <Select
              value={city}
              onValueChange={setCity}
              disabled={province === 'all' || citiesLoading}
            >
              <SelectTrigger aria-labelledby="filter-city-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                {cities.map((cityName) => (
                  <SelectItem key={cityName} value={cityName}>
                    {cityName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {citiesLoading && (
              <p className="text-xs text-gray-500 mt-1">Ładowanie miast...</p>
            )}
          </div>
        </div>

        {/* Forecast toggle */}
        <div className="mt-4 mb-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showForecast}
              onChange={(e) => setShowForecast(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                showForecast ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showForecast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
            <span className="ml-3 text-sm font-medium text-gray-300">
              Pokaż prognozy
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
