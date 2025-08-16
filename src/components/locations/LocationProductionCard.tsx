'use client'

import { useState, useEffect } from 'react'
import { Zap, Sun, TrendingUp, Battery } from 'lucide-react'
import { getInsolationData } from '@/lib/supabase/queries'
import { calculatePVProduction, formatProduction, getProductionStatus } from '@/lib/utils/pv-production'
import type { UserLocation, InsolationData } from '@/types'

interface LocationProductionCardProps {
  location: UserLocation
  className?: string
}

export function LocationProductionCard({ location, className = '' }: LocationProductionCardProps) {
  const [currentProduction, setCurrentProduction] = useState<number>(0)
  const [insolationPercentage, setInsolationPercentage] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrentProduction = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const now = new Date()
        const currentDate = now.toISOString().split('T')[0]
        const currentHour = now.getHours()

        const insolationData = await getInsolationData(location.city, currentDate)
        const currentHourData = insolationData.find((data: InsolationData) => data.hour === currentHour)

        if (currentHourData) {
          const insolation = currentHourData.insolation_percentage
          const production = calculatePVProduction(location.pv_power_kwp, insolation)
          
          setInsolationPercentage(insolation)
          setCurrentProduction(production)
        } else {
          setInsolationPercentage(0)
          setCurrentProduction(0)
        }
      } catch (err) {
        console.error('Failed to fetch production data:', err)
        setError('Nie udało się pobrać danych produkcji')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentProduction()
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchCurrentProduction, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [location.city, location.pv_power_kwp])

  const maxPotentialProduction = location.pv_power_kwp // Maximum possible production
  const productionStatus = getProductionStatus(currentProduction, maxPotentialProduction)

  if (isLoading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-950/50 border border-red-500/20 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <Zap className="h-4 w-4 text-red-400 mr-2" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 bg-emerald-950/50 rounded-lg ring-1 ring-emerald-500/20">
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-300">Aktualna produkcja</p>
            <p className={`text-lg font-bold ${productionStatus.color}`}>
              {formatProduction(currentProduction)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center text-sm text-gray-400">
            <Sun className="h-3 w-3 mr-1" />
            {insolationPercentage.toFixed(0)}%
          </div>
          <div className={`text-xs ${productionStatus.color}`}>
            {productionStatus.status === 'excellent' && 'Doskonała'}
            {productionStatus.status === 'good' && 'Dobra'}
            {productionStatus.status === 'fair' && 'Średnia'}
            {productionStatus.status === 'poor' && 'Słaba'}
            {productionStatus.status === 'offline' && 'Brak'}
          </div>
        </div>
      </div>

      {/* Production efficiency bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Wydajność</span>
          <span>{productionStatus.percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              productionStatus.status === 'excellent' ? 'bg-emerald-500' :
              productionStatus.status === 'good' ? 'bg-blue-500' :
              productionStatus.status === 'fair' ? 'bg-amber-500' :
              productionStatus.status === 'poor' ? 'bg-red-500' :
              'bg-gray-500'
            }`}
            style={{ width: `${Math.min(productionStatus.percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center">
          <TrendingUp className="h-3 w-3 text-blue-400 mr-1" />
          <span className="text-gray-400">Moc max:</span>
          <span className="text-gray-300 ml-1">{formatProduction(location.pv_power_kwp)}</span>
        </div>
        <div className="flex items-center">
          <Battery className="h-3 w-3 text-amber-400 mr-1" />
          <span className="text-gray-400">Status:</span>
          <span className={`ml-1 ${productionStatus.color}`}>
            {currentProduction > 0 ? 'Aktywne' : 'Nieaktywne'}
          </span>
        </div>
      </div>

      {/* Live indicator */}
      {currentProduction > 0 && (
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center text-xs text-emerald-400">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
            <span>Na żywo</span>
          </div>
        </div>
      )}
    </div>
  )
}