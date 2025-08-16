'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Filter, Calendar, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInsolationCities } from '@/hooks/useInsolation'
import { POLISH_PROVINCES } from '@/types'

interface InsolationFiltersProps {
  onFiltersChange: (filters: {
    province?: string
    city?: string
    startDate?: string
    endDate?: string
    hour?: string
  }) => void
  initialFilters?: {
    province?: string
    city?: string
    startDate?: string
    endDate?: string
    hour?: string
  }
  className?: string
}

export function InsolationFilters({ 
  onFiltersChange, 
  initialFilters = {},
  className = '' 
}: InsolationFiltersProps) {
  const [province, setProvince] = useState(initialFilters.province || 'all')
  const [city, setCity] = useState(initialFilters.city || 'all')
  const [startDate, setStartDate] = useState(initialFilters.startDate || '')
  const [endDate, setEndDate] = useState(initialFilters.endDate || '')
  const [hour, setHour] = useState(initialFilters.hour || 'all')
  const [isExpanded, setIsExpanded] = useState(false)
  const hasInitialized = useRef(false)

  const { cities, fetchCities, isLoading: citiesLoading } = useInsolationCities(province)

  useEffect(() => {
    if (province !== 'all') {
      fetchCities()
    }
  }, [province, fetchCities])

  useEffect(() => {
    // Reset city when province changes
    if (province === 'all') {
      setCity('all')
    } else if (cities.length > 0 && !cities.includes(city)) {
      setCity('all')
    }
  }, [province, cities, city])

  const applyFilters = useCallback(() => {
    const filters = {
      province: province === 'all' ? undefined : province,
      city: city === 'all' ? undefined : city,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      hour: hour === 'all' ? undefined : hour,
    }
    onFiltersChange(filters)
  }, [province, city, startDate, endDate, hour, onFiltersChange])

  // Auto-apply filters with debounce (skip initial mount)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true
      return
    }

    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 600) // 600ms debounce for better UX

    return () => clearTimeout(timeoutId)
  }, [applyFilters])

  const handleClearFilters = () => {
    setProvince('all')
    setCity('all')
    setStartDate('')
    setEndDate('')
    setHour('all')
    onFiltersChange({})
  }

  const hasActiveFilters = province !== 'all' || city !== 'all' || startDate || endDate || hour !== 'all'

  // Generate hour options
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString(),
    label: `${i.toString().padStart(2, '0')}:00`
  }))

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-gray-400 mr-2" />
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

      <div className={`p-4 ${isExpanded ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Province filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="h-4 w-4 inline mr-1" />
              Województwo
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Wszystkie</option>
              {POLISH_PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* City filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Miasto
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={province === 'all' || citiesLoading}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">Wszystkie</option>
              {cities.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
            {citiesLoading && (
              <p className="text-xs text-gray-500 mt-1">Ładowanie miast...</p>
            )}
          </div>

          {/* Start date filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data od
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End date filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Data do
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Hour filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Godzina
            </label>
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Wszystkie</option>
              {hourOptions.map((hourOption) => (
                <option key={hourOption.value} value={hourOption.value}>
                  {hourOption.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters button */}
        {hasActiveFilters && (
          <div className="flex items-center">
            <Button variant="outline" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Wyczyść filtry
            </Button>
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">Aktywne filtry:</p>
            <div className="flex flex-wrap gap-2">
              {province !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-950/50 text-blue-400 ring-1 ring-blue-500/20">
                  Województwo: {province}
                </span>
              )}
              {city !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-950/50 text-green-400 ring-1 ring-green-500/20">
                  Miasto: {city}
                </span>
              )}
              {startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-950/50 text-purple-400 ring-1 ring-purple-500/20">
                  Od: {startDate}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-950/50 text-purple-400 ring-1 ring-purple-500/20">
                  Do: {endDate}
                </span>
              )}
              {hour !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-950/50 text-amber-400 ring-1 ring-amber-500/20">
                  Godzina: {hourOptions.find(h => h.value === hour)?.label}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}