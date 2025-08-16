'use client'

import { useLocations } from '@/hooks/useLocations'
import { MapPin, Zap, FileText, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatPower } from '@/lib/utils'

export default function DashboardPage() {
  const { data: locations = [], isLoading } = useLocations()

  const primaryLocation = locations.find(loc => loc.is_primary)
  const totalPower = locations.reduce((sum, loc) => sum + loc.pv_power_kwp, 0)

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100">Panel główny</h1>
        <p className="text-gray-400 mt-2">
          Witaj w GridSync - zarządzaj swoją energią słoneczną
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-2 bg-blue-950/50 rounded-lg ring-1 ring-blue-500/20">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Lokalizacje</p>
              <p className="text-2xl font-bold text-gray-100">{locations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-950/50 rounded-lg ring-1 ring-emerald-500/20">
              <Zap className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Łączna moc</p>
              <p className="text-2xl font-bold text-gray-100">{formatPower(totalPower)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="flex items-center">
            <div className="p-2 bg-amber-950/50 rounded-lg ring-1 ring-amber-500/20">
              <FileText className="h-6 w-6 text-amber-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Status</p>
              <p className="text-2xl font-bold text-gray-100">Aktywne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Locations overview */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
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
                    className="flex items-center justify-between p-4 border border-gray-700 rounded-lg bg-gray-800/50"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${location.is_primary ? 'bg-blue-950/50 ring-1 ring-blue-500/20' : 'bg-gray-700'}`}>
                        <MapPin className={`h-4 w-4 ${location.is_primary ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-100">
                          {location.name}
                          {location.is_primary && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/50 text-blue-400 ring-1 ring-blue-500/20">
                              Główna
                            </span>
                          )}
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
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-gray-100">Szybkie akcje</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/dashboard/locations"
              className="flex items-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="p-2 bg-blue-950/50 rounded-lg ring-1 ring-blue-500/20">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-100">Zarządzaj lokalizacjami</p>
                <p className="text-sm text-gray-400">Dodaj lub edytuj swoje instalacje PV</p>
              </div>
            </Link>

            <Link
              href="/dashboard/reports"
              className="flex items-center p-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <div className="p-2 bg-emerald-950/50 rounded-lg ring-1 ring-emerald-500/20">
                <FileText className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-100">Generuj raport</p>
                <p className="text-sm text-gray-400">Utwórz plik CSV z bilansem energetycznym</p>
              </div>
            </Link>

            {primaryLocation && (
              <div className="p-4 bg-blue-950/50 border border-blue-500/20 rounded-lg">
                <p className="text-sm font-medium text-blue-400 mb-2">
                  Lokalizacja główna: {primaryLocation.name}
                </p>
                <p className="text-sm text-blue-300">
                  {primaryLocation.city} • {formatPower(primaryLocation.pv_power_kwp)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}