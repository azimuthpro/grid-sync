'use client'

import { useLocations } from '@/hooks/useLocations'
import { MapPin, Zap, FileText, Plus, Sun } from 'lucide-react'
import Link from 'next/link'
import { formatPower } from '@/lib/utils'
import { ProductionSummaryWidget } from '@/components/dashboard/ProductionSummaryWidget'
import { SYSTEM_LOSSES } from '@/types'

export default function DashboardPage() {
  const { data: locations = [], isLoading } = useLocations()

  // Calculate summary statistics
  const totalPower = locations.reduce((sum, loc) => sum + loc.pv_power_kwp, 0)
  const averagePower = locations.length > 0 ? totalPower / locations.length : 0
  const uniqueCities = [...new Set(locations.map(loc => loc.city))]

  // Calculate average system efficiency
  const customEfficiencies = locations
    .filter(loc => loc.system_losses !== undefined)
    .map(loc => loc.system_losses!)
  const hasCustomEfficiencies = customEfficiencies.length > 0
  const avgEfficiency = hasCustomEfficiencies 
    ? customEfficiencies.reduce((a, b) => a + b, 0) / customEfficiencies.length
    : Math.round(SYSTEM_LOSSES * 100)

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-700 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-md hover:shadow-lg hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-blue-900 rounded-lg border border-blue-700">
              <MapPin className="h-6 w-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Lokalizacje</p>
              <p className="text-2xl font-bold text-gray-100">{locations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-md hover:shadow-lg hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-900 rounded-lg border border-emerald-700">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Łączna moc</p>
              <p className="text-2xl font-bold text-gray-100">{formatPower(totalPower)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-md hover:shadow-lg hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center">
            <div className="p-2 bg-amber-900 rounded-lg border border-amber-700">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Średnia moc</p>
              <p className="text-2xl font-bold text-gray-100">{formatPower(averagePower)}</p>
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

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Locations overview */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-md">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-100">Twoje lokalizacje</h2>
              <Link
                href="/dashboard/locations"
                className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
              >
                Zobacz wszystkie
              </Link>
            </div>
          </div>
          <div className="p-6">
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Nie masz jeszcze żadnych lokalizacji</p>
                <Link
                  href="/dashboard/locations"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Dodaj pierwszą lokalizację
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {locations.slice(0, 3).map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800 hover:bg-gray-750 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-100">
                          {location.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {location.city} • {formatPower(location.pv_power_kwp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {locations.length > 3 && (
                  <p className="text-sm text-gray-400 text-center">
                    i {locations.length - 3} więcej lokalizacji...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-md">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-gray-100">Szybkie akcje</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/dashboard/locations"
              className="flex items-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
            >
              <div className="p-2 bg-blue-900 rounded-lg border border-blue-700">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-100">Zarządzaj lokalizacjami</p>
                <p className="text-sm text-gray-400">Dodaj lub edytuj swoje instalacje PV</p>
              </div>
            </Link>

            <Link
              href="/dashboard/insolation"
              className="flex items-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
            >
              <div className="p-2 bg-amber-900 rounded-lg border border-amber-700">
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-100">Dane nasłonecznienia</p>
                <p className="text-sm text-gray-400">Przeglądaj dane nasłonecznienia według regionów</p>
              </div>
            </Link>

            <Link
              href="/dashboard/reports"
              className="flex items-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
            >
              <div className="p-2 bg-emerald-900 rounded-lg border border-emerald-700">
                <FileText className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-100">Generuj raport</p>
                <p className="text-sm text-gray-400">Utwórz plik CSV z bilansem energetycznym</p>
              </div>
            </Link>

            {locations.length > 0 && (
              <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg">
                <p className="text-sm font-medium text-blue-400 mb-3">
                  Podsumowanie wszystkich lokalizacji
                </p>
                <div className="space-y-2 text-sm text-blue-300">
                  <div className="flex justify-between">
                    <span>Średnia moc na lokalizację:</span>
                    <span className="font-medium">{formatPower(averagePower)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Miasta ({uniqueCities.length}):</span>
                    <span className="font-medium">{uniqueCities.slice(0, 2).join(', ')}{uniqueCities.length > 2 ? ` +${uniqueCities.length - 2}` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Średnia sprawność systemu:</span>
                    <span className="font-medium">{Math.round(avgEfficiency)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}