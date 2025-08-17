'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { RefreshCw, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InsolationFilters } from '@/components/insolation/InsolationFilters'
import { InsolationChart } from '@/components/insolation/InsolationChart'
import { InsolationDataTable } from '@/components/insolation/InsolationDataTable'
import { useInsolation, useInsolationChart, useLatestDate } from '@/hooks/useInsolation'
import type { InsolationData } from '@/types'

interface InsolationFilters extends Record<string, string | undefined> {
  province?: string
  city?: string
}

type TimeRange = '24h' | '3d' | '7d' | '1m'

export default function InsolationPage() {
  const [filters, setFilters] = useState<InsolationFilters>({})
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [chartViewType, setChartViewType] = useState<'hourly' | 'daily' | 'monthly'>('daily')
  const [tableTimeRange, setTableTimeRange] = useState<TimeRange>('24h')
  const [accumulatedTableData, setAccumulatedTableData] = useState<InsolationData[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const shouldResetData = useRef(false)

  // Get latest date from database
  const { latestDate, fetchLatestDate } = useLatestDate()

  // Fetch latest date on component mount
  useEffect(() => {
    fetchLatestDate()
  }, [fetchLatestDate])

  // Calculate date range for table based on selected time range and latest date from DB
  const tableFilters = useMemo(() => {
    // Use latest date from database or fallback to today
    const referenceDate = latestDate ? new Date(latestDate) : new Date()
    let startDate: string
    const endDate = referenceDate.toISOString().split('T')[0]

    switch (tableTimeRange) {
      case '24h':
        startDate = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '3d':
        startDate = new Date(referenceDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '7d':
        startDate = new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case '1m':
        startDate = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      default:
        startDate = new Date(referenceDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    return {
      ...filters,
      startDate,
      endDate,
      page,
      limit: 50,
      sortBy,
      sortOrder
    }
  }, [filters, tableTimeRange, page, sortBy, sortOrder, latestDate])

  // Separate data fetching for table (with pagination)
  const { 
    data: tableData, 
    pagination, 
    error: tableError, 
    isLoading: tableLoading, 
    mutate: mutateTable 
  } = useInsolation(tableFilters)


  // Separate data fetching for chart (no pagination, grouped by backend)
  const {
    data: chartData,
    error: chartError,
    isLoading: chartLoading,
    mutate: mutateChart
  } = useInsolationChart(chartViewType, filters)


  const handleFiltersChange = (newFilters: InsolationFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page when filters change
    shouldResetData.current = true // Mark for data reset
    setAccumulatedTableData([]) // Clear accumulated data
  }

  const handleTableTimeRangeChange = (timeRange: TimeRange) => {
    setTableTimeRange(timeRange)
    setPage(1)
    shouldResetData.current = true // Mark for data reset
    setAccumulatedTableData([]) // Clear accumulated data when time range changes
  }

  const handleLoadMore = useCallback(async () => {
    if (!pagination?.hasNextPage || isLoadingMore || tableLoading) return
    
    setIsLoadingMore(true)
    setPage(prev => prev + 1)
  }, [pagination?.hasNextPage, isLoadingMore, tableLoading])

  // Accumulate data when new page loads
  useEffect(() => {
    // Don't process data while loading to avoid race conditions
    if (tableLoading) {
      return
    }
    
    if (!tableData || tableData.length === 0) {
      // If we were loading more and got no data, stop loading
      if (isLoadingMore) {
        setIsLoadingMore(false)
      }
      return
    }

    // If we need to reset data (due to filter/sort/time range change) or it's the first page and we have no accumulated data
    if (shouldResetData.current || (page === 1 && accumulatedTableData.length === 0)) {
      setAccumulatedTableData(tableData)
      shouldResetData.current = false // Reset the flag
    } else {
      // Append new data to existing accumulated data
      setAccumulatedTableData(prev => {
        // Prevent duplicates by checking if data is already included
        const existingIds = new Set(prev.map(item => `${item.date}-${item.hour}-${item.city}`))
        const newData = tableData.filter(item => !existingIds.has(`${item.date}-${item.hour}-${item.city}`))
        return newData.length > 0 ? [...prev, ...newData] : prev
      })
    }

    // Set loading to false after data is processed successfully
    if (isLoadingMore) {
      setIsLoadingMore(false)
    }
  }, [tableData, page, tableLoading, isLoadingMore, accumulatedTableData.length])

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(1) // Reset to first page when sorting changes
    shouldResetData.current = true // Mark for data reset
    setAccumulatedTableData([]) // Clear accumulated data
  }

  const handleRefresh = () => {
    setPage(1)
    shouldResetData.current = true // Mark for data reset
    setAccumulatedTableData([])
    mutateTable()
    mutateChart()
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
            <h1 className="text-2xl font-bold text-gray-100">Nasłonecznienie</h1>
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
      {!error && (chartData.length > 0 || accumulatedTableData.length > 0) && (
        <>
          {/* Chart Section */}
          {chartData.length > 0 && (
            <div className="mb-8">
              <InsolationChart 
                key={chartKey}
                data={chartData}
                viewType={chartViewType}
                onViewTypeChange={setChartViewType}
                isLoading={chartLoading}
              />
            </div>
          )}

          {/* Table Section */}
          {!isLoading && (
            <InsolationDataTable
              data={accumulatedTableData.length > 0 ? accumulatedTableData : (tableData || [])}
              hasMore={pagination?.hasNextPage || false}
              isLoadingMore={isLoadingMore}
              onLoadMore={handleLoadMore}
              onTimeRangeChange={handleTableTimeRangeChange}
              timeRange={tableTimeRange}
              onSortChange={handleSortChange}
              sorting={{ sortBy, sortOrder }}
              filters={filters}
              currentDate={new Date().toISOString().split('T')[0]}
            />
          )}
        </>
      )}

      {/* No data message */}
      {!isLoading && !error && chartData.length === 0 && accumulatedTableData.length === 0 && (
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