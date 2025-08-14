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
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel główny</h1>
        <p className="text-gray-600 mt-2">
          Witaj w GridSync - zarządzaj swoją energią słoneczną
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lokalizacje</p>
              <p className="text-2xl font-bold text-gray-900">{locations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Łączna moc</p>
              <p className="text-2xl font-bold text-gray-900">{formatPower(totalPower)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-2xl font-bold text-gray-900">Aktywne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Locations overview */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Twoje lokalizacje</h2>
              <Link
                href="/dashboard/locations"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Zobacz wszystkie
              </Link>
            </div>
          </div>
          <div className="p-6">
            {locations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych lokalizacji</p>
                <Link
                  href="/dashboard/locations"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${location.is_primary ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <MapPin className={`h-4 w-4 ${location.is_primary ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {location.name}
                          {location.is_primary && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Główna
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          {location.city} • {formatPower(location.pv_power_kwp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {locations.length > 3 && (
                  <p className="text-sm text-gray-500 text-center">
                    i {locations.length - 3} więcej lokalizacji...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Szybkie akcje</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              href="/dashboard/locations"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Zarządzaj lokalizacjami</p>
                <p className="text-sm text-gray-500">Dodaj lub edytuj swoje instalacje PV</p>
              </div>
            </Link>

            <Link
              href="/dashboard/reports"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Generuj raport</p>
                <p className="text-sm text-gray-500">Utwórz plik CSV z bilansem energetycznym</p>
              </div>
            </Link>

            {primaryLocation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Lokalizacja główna: {primaryLocation.name}
                </p>
                <p className="text-sm text-blue-700">
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