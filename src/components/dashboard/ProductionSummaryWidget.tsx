'use client'

import { useState, useEffect } from 'react'
import { Zap, Sun, TrendingUp, Activity, Home } from 'lucide-react'
import { useLocations } from '@/hooks/useLocations'
import { formatProduction } from '@/lib/utils/pv-production'

interface ProductionSummaryWidgetProps {
  className?: string
}

interface LocationProduction {
  locationId: string
  currentProduction: number
  dailyProduction: number
  currentConsumption: number
  dailyConsumption: number
  insolationPercentage: number
  selfConsumptionRate: number
  energyBalance: number
}

interface ProductionSummaryResponse {
  success: boolean
  data: LocationProduction[]
  metadata: {
    date: string
    hour: number
    totalLocations: number
  }
}

export function ProductionSummaryWidget({ className = '' }: ProductionSummaryWidgetProps) {
  const { data: locations = [], isLoading: locationsLoading } = useLocations()
  const [locationProductions, setLocationProductions] = useState<LocationProduction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProductionData = async () => {
      if (locationsLoading || locations.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Prepare location IDs for API call
        const locationIds = locations.map(loc => loc.id).join(',')
        
        const response = await fetch(`/api/production-summary?locationIds=${locationIds}`)
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data: ProductionSummaryResponse = await response.json()
        
        if (!data.success) {
          throw new Error('API returned error response')
        }

        setLocationProductions(data.data)
      } catch (err) {
        console.error('Failed to fetch production summary:', err)
        setError('Nie udało się pobrać danych produkcji')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductionData()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchProductionData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [locations, locationsLoading])

  const totalCurrentProduction = locationProductions.reduce((sum, loc) => sum + loc.currentProduction, 0)
  const totalDailyProduction = locationProductions.reduce((sum, loc) => sum + loc.dailyProduction, 0)
  const totalCurrentConsumption = locationProductions.reduce((sum, loc) => sum + loc.currentConsumption, 0)
  const totalEnergyBalance = locationProductions.reduce((sum, loc) => sum + loc.energyBalance, 0)
  const averageInsolation = locationProductions.length > 0 
    ? locationProductions.reduce((sum, loc) => sum + loc.insolationPercentage, 0) / locationProductions.length
    : 0

  // Calculate overall self-consumption rate (how much produced energy is being used locally)
  const selfConsumptionPercentage = totalCurrentProduction > 0 
    ? Math.min((totalCurrentConsumption / totalCurrentProduction) * 100, 100)
    : 0

  if (locationsLoading || isLoading) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
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
    )
  }

  if (locations.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
        <div className="p-6 text-center">
          <Sun className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Brak lokalizacji do monitorowania produkcji</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">Produkcja energii</h2>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/50 border-b border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="p-6">
        {/* Main metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-emerald-950/50 rounded-lg ring-1 ring-emerald-500/20">
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Aktualna moc</p>
            <p className="text-xl font-bold text-emerald-400">
              {formatProduction(totalCurrentProduction)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-blue-950/50 rounded-lg ring-1 ring-blue-500/20">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Dziś wyprodukowano</p>
            <p className="text-xl font-bold text-blue-400">
              {formatProduction(totalDailyProduction, 'kWh')}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-orange-950/50 rounded-lg ring-1 ring-orange-500/20">
                <Home className="h-5 w-5 text-orange-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Aktualne zużycie</p>
            <p className="text-xl font-bold text-orange-400">
              {formatProduction(totalCurrentConsumption)}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-amber-950/50 rounded-lg ring-1 ring-amber-500/20">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Średnie nasłonecznienie</p>
            <p className="text-xl font-bold text-amber-400">
              {averageInsolation.toFixed(0)}%
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="p-2 bg-purple-950/50 rounded-lg ring-1 ring-purple-500/20">
                <Activity className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-1">Autokonsumpcja</p>
            <p className="text-xl font-bold text-purple-400">
              {selfConsumptionPercentage.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Self-consumption efficiency indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Poziom autokonsumpcji energii</span>
            <span>{totalCurrentConsumption.toFixed(1)} / {totalCurrentProduction.toFixed(1)} kW</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                selfConsumptionPercentage >= 80 ? 'bg-emerald-500' :
                selfConsumptionPercentage >= 60 ? 'bg-blue-500' :
                selfConsumptionPercentage >= 40 ? 'bg-amber-500' :
                selfConsumptionPercentage > 0 ? 'bg-red-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(selfConsumptionPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{totalEnergyBalance >= 0 ? 'Nadwyżka' : 'Niedobór'}: {Math.abs(totalEnergyBalance).toFixed(1)} kW</span>
            <span>{totalEnergyBalance >= 0 ? 'Export do sieci' : 'Import z sieci'}</span>
          </div>
        </div>

        {/* Location breakdown */}
        {locationProductions.length > 1 && (
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Podział na lokalizacje</h3>
            <div className="space-y-2">
              {locationProductions.map((locationProd) => {
                const location = locations.find(loc => loc.id === locationProd.locationId)
                if (!location) return null
                
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
                          {location.city} • {locationProd.insolationPercentage.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-200">
                        {formatProduction(locationProd.currentProduction)} / {formatProduction(locationProd.currentConsumption)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Autokonsumpcja: {locationProd.selfConsumptionRate.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}