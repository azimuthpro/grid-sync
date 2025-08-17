'use client'

import { useState, useEffect, useMemo } from 'react'
import { Sun, MapPin, Database, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InsolationFilters } from '@/components/insolation/InsolationFilters'
import { InsolationChart } from '@/components/insolation/InsolationChart'
import { InsolationDataTable } from '@/components/insolation/InsolationDataTable'
import { useInsolation, useInsolationChart, useInsolationStatistics } from '@/hooks/useInsolation'

interface InsolationFilters extends Record<string, string | undefined> {
  province?: string
  city?: string
  hour?: string
}

export default function InsolationPage() {
  const [filters, setFilters] = useState<InsolationFilters>({})
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [chartViewType, setChartViewType] = useState<'hourly' | 'daily' | 'monthly'>('daily')

  // Separate data fetching for table (with pagination)
  const { 
    data: tableData, 
    pagination, 
    error: tableError, 
    isLoading: tableLoading, 
    mutate: mutateTable 
  } = useInsolation({
    ...filters,
    page,
    limit: 50,
    sortBy,
    sortOrder
  })

  // Separate data fetching for chart (no pagination, grouped by backend)
  const {
    data: chartData,
    error: chartError,
    isLoading: chartLoading,
    mutate: mutateChart
  } = useInsolationChart(chartViewType, filters)

  const { 
    statistics, 
    fetchStatistics
  } = useInsolationStatistics()

  // Fetch statistics on component mount
  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const handleFiltersChange = (newFilters: InsolationFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1) // Reset to first page when sorting changes
  }

  const handleRefresh = () => {
    mutateTable()
    mutateChart()
    fetchStatistics()
  }

  // Create a stable chart key to prevent unnecessary remounts
  const chartKey = useMemo(() => {
    const filterKey = JSON.stringify(filters)
    return `chart-${chartViewType}-${filterKey}-${chartData.length}`
  }, [filters, chartViewType, chartData.length])

  // Combined error and loading states
  const error = tableError || chartError
  const isLoading = tableLoading

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Dane nasłonecznienia</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Odśwież
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-950/50 rounded-lg ring-1 ring-blue-500/20">
                <Database className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Łączne pomiary</p>
                <p className="text-2xl font-bold text-gray-100">
                  {statistics.totalRecords.toLocaleString('pl-PL')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-950/50 rounded-lg ring-1 ring-emerald-500/20">
                <MapPin className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Miasta</p>
                <p className="text-2xl font-bold text-gray-100">{statistics.uniqueCities}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-amber-950/50 rounded-lg ring-1 ring-amber-500/20">
                <MapPin className="h-6 w-6 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Województwa</p>
                <p className="text-2xl font-bold text-gray-100">{statistics.uniqueProvinces}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-purple-950/50 rounded-lg ring-1 ring-purple-500/20">
                <Sun className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Ostatnie dane</p>
                <p className="text-lg font-bold text-gray-100">
                  {statistics.latestDate ? 
                    new Date(statistics.latestDate).toLocaleDateString('pl-PL') : 
                    'Brak danych'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8">
        <InsolationFilters 
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-8 bg-red-950/50 border border-red-500/20 rounded-md p-4">
          <p className="text-red-400">
            Wystąpił błąd podczas ładowania danych: {error.message || error}
          </p>
        </div>
      )}

      {/* Loading state with skeleton */}
      {isLoading && (
        <>
          <div className="mb-8 bg-gray-900 rounded-lg border border-gray-800 p-8">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-3" />
              <span className="text-gray-400">Ładowanie danych...</span>
            </div>
          </div>
          
          {/* Chart skeleton when data exists but is reloading */}
          {chartData.length > 0 && (
            <div className="mb-8 bg-gray-900 rounded-lg border border-gray-800 p-6">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-80 bg-gray-800 rounded"></div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Chart and Table */}
      {!error && (chartData.length > 0 || tableData.length > 0) && (
        <>
          {/* Chart Section */}
          {chartData.length > 0 && (
            <div className="mb-8">
              <InsolationChart 
                key={chartKey}
                data={chartData}
                viewType={chartViewType}
                onViewTypeChange={setChartViewType}
                title="Wykres nasłonecznienia"
                isLoading={chartLoading}
              />
            </div>
          )}

          {/* Table Section */}
          {!isLoading && tableData.length > 0 && (
            <InsolationDataTable
              data={tableData}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              sorting={{ sortBy, sortOrder }}
              filters={filters}
            />
          )}
        </>
      )}

      {/* No data message */}
      {!isLoading && !error && chartData.length === 0 && tableData.length === 0 && (
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-12 text-center">
          <Sun className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">Brak danych</h3>
          <p className="text-gray-400 mb-6">
            Nie znaleziono danych dla wybranych filtrów. Spróbuj zmienić kryteria wyszukiwania.
          </p>
          <Button
            onClick={() => handleFiltersChange({})}
            variant="outline"
          >
            Wyczyść wszystkie filtry
          </Button>
        </div>
      )}
    </div>
  )
}