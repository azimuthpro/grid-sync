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
          const systemLossesDecimal = location.system_losses ? location.system_losses / 100 : undefined
          const production = calculatePVProduction(location.pv_power_kwp, insolation, systemLossesDecimal)
          
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
  }, [location.city, location.pv_power_kwp, location.system_losses])

  const maxPotentialProduction = location.pv_power_kwp // Maximum possible production
  const productionStatus = getProductionStatus(currentProduction, maxPotentialProduction)

  if (isLoading) {
    return (
      <div className={`bg-gray-800 border border-gray-600 rounded-lg p-4 ${className}`}>
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
    )
  }

  if (error) {
    return (
      <div className={`bg-red-950 border border-red-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <div className="p-2 bg-red-900 rounded-lg border border-red-700">
            <Zap className="h-4 w-4 text-red-400" />
          </div>
          <span className="text-red-400 text-sm ml-3 font-medium">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-md hover:shadow-lg hover:border-gray-500 transition-all duration-300 ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-900 rounded-lg border border-emerald-700">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300 mb-1">Aktualna produkcja</p>
              <p className={`text-xl font-bold ${productionStatus.color} bg-gradient-to-r from-current to-current bg-clip-text`}>
                {formatProduction(currentProduction)}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center justify-end text-sm text-gray-400 mb-1">
              <Sun className="h-4 w-4 mr-2 text-amber-400" />
              <span className="font-medium">{insolationPercentage.toFixed(0)}%</span>
            </div>
            <div className={`text-xs font-medium px-2 py-1 rounded-full border ${
              productionStatus.status === 'excellent' ? 'bg-emerald-900 text-emerald-300 border-emerald-700' :
              productionStatus.status === 'good' ? 'bg-blue-900 text-blue-300 border-blue-700' :
              productionStatus.status === 'fair' ? 'bg-amber-900 text-amber-300 border-amber-700' :
              productionStatus.status === 'poor' ? 'bg-red-900 text-red-300 border-red-700' :
              'bg-gray-800 text-gray-300 border-gray-600'
            }`}>
              {productionStatus.status === 'excellent' && 'Doskonała'}
              {productionStatus.status === 'good' && 'Dobra'}
              {productionStatus.status === 'fair' && 'Średnia'}
              {productionStatus.status === 'poor' && 'Słaba'}
              {productionStatus.status === 'offline' && 'Brak'}
            </div>
          </div>
        </div>

        {/* Production efficiency bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span className="font-medium">Wydajność</span>
            <span className="font-bold">{productionStatus.percentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 border border-gray-600 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out ${
                productionStatus.status === 'excellent' ? 'bg-emerald-500' :
                productionStatus.status === 'good' ? 'bg-blue-500' :
                productionStatus.status === 'fair' ? 'bg-amber-500' :
                productionStatus.status === 'poor' ? 'bg-red-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${Math.min(productionStatus.percentage, 100)}%` }}
            >
            </div>
          </div>
        </div>

        {/* Additional metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg border border-gray-600">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <div>
              <span className="text-gray-400 block">Moc max</span>
              <span className="text-gray-200 font-semibold">{formatProduction(location.pv_power_kwp)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded-lg border border-gray-600">
            <Battery className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-gray-400 block">Status</span>
              <span className={`font-semibold ${productionStatus.color}`}>
                {currentProduction > 0 ? 'Aktywne' : 'Nieaktywne'}
              </span>
            </div>
          </div>
        </div>

        {/* Live indicator */}
        {currentProduction > 0 && (
          <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-600">
            <div className="flex items-center text-xs font-medium">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-emerald-400 bg-emerald-900 px-2 py-1 rounded-full border border-emerald-700">
                Dane na żywo
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}