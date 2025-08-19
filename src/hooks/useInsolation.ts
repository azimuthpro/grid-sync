import useSWR from 'swr'
import { useState, useCallback } from 'react'
import type { InsolationData } from '@/types'
import { APP_TIMEZONE } from '@/types'
import { toZonedTime } from 'date-fns-tz'

interface InsolationFilters {
  province?: string
  city?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
  showForecast?: boolean
}

interface InsolationResponse {
  data: InsolationData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: InsolationFilters
  sorting: {
    sortBy: string
    sortOrder: string
  }
}

interface InsolationChartResponse {
  data: InsolationData[]
  viewType: string
  dateRange: { startDate: string; endDate: string }
  filters: InsolationFilters
}


const fetcher = async (url: string): Promise<InsolationResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch insolation data')
  }
  return response.json()
}

const chartFetcher = async (url: string): Promise<InsolationChartResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch chart data')
  }
  return response.json()
}

export function useInsolation(filters: InsolationFilters = {}) {
  const searchParams = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })

  const url = `/api/insolation?${searchParams.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR<InsolationResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false, // Prevent unnecessary revalidation
      revalidateOnMount: true,
      revalidateIfStale: false, // Don't revalidate stale data automatically
      dedupingInterval: 300000, // 5 minutes to reduce duplicate requests
      errorRetryCount: 2, // Reduce retry attempts
      errorRetryInterval: 3000, // Faster retry interval
      keepPreviousData: true, // Keep previous data while loading new data
      refreshInterval: 0, // Disable automatic refresh
      focusThrottleInterval: 60000, // Throttle focus events
    }
  )

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    filters: data?.filters,
    sorting: data?.sorting,
    error,
    isLoading,
    mutate
  }
}

export function useInsolationCities(province?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchCities = useCallback(async () => {
    if (!province || province === 'all') {
      setCities([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insolation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getCities',
          province
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch cities')
      }

      const data = await response.json()
      setCities(data.cities || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cities')
      setCities([])
    } finally {
      setIsLoading(false)
    }
  }, [province])

  return {
    cities,
    isLoading,
    error,
    fetchCities
  }
}


export function useInsolationChart(viewType: 'hourly' | 'daily' | 'monthly', filters: InsolationFilters = {}) {
  const searchParams = new URLSearchParams()
  
  // Add viewType parameter for chart-specific API call
  searchParams.append('viewType', viewType)
  
  // Add other filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && key !== 'page' && key !== 'limit') {
      searchParams.append(key, String(value))
    }
  })

  const url = `/api/insolation/charts?${searchParams.toString()}`
  
  const { data, error, isLoading, mutate } = useSWR<InsolationChartResponse>(
    url,
    chartFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      revalidateIfStale: false,
      dedupingInterval: 120000, // 2 minutes for chart data
      errorRetryCount: 2,
      errorRetryInterval: 3000,
      keepPreviousData: true,
      refreshInterval: 0,
    }
  )

  return {
    data: data?.data || [],
    viewType: data?.viewType,
    dateRange: data?.dateRange,
    filters: data?.filters,
    error,
    isLoading,
    mutate
  }
}

export function useLatestDate() {
  const [latestDate, setLatestDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLatestDate = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insolation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getLatestDate'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch latest date')
      }

      const data = await response.json()
      setLatestDate(data.latestDate)
      return data.latestDate
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch latest date')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    latestDate,
    isLoading,
    error,
    fetchLatestDate
  }
}

export function useInsolationExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const exportToCSV = async (filters: InsolationFilters = {}, filename = 'insolation-data.csv') => {
    setIsExporting(true)
    setError(null)

    try {
      // Fetch all data (remove pagination for export)
      const exportFilters = { ...filters, limit: 10000, page: 1 }
      const searchParams = new URLSearchParams()
      
      Object.entries(exportFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })

      const response = await fetch(`/api/insolation?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data for export')
      }

      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No data available for export')
      }

      // Convert to CSV
      const csvHeaders = ['Date', 'Hour', 'City', 'Province', 'Insolation %']
      const csvRows = data.data.map((row: InsolationData) => [
        row.date,
        row.hour.toString(),
        row.city,
        row.province || '',
        row.insolation_percentage.toString()
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map((row: string[]) => row.join(','))
      ].join('\n')

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      return data.data.length
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
      throw err
    } finally {
      setIsExporting(false)
    }
  }

  return {
    exportToCSV,
    isExporting,
    error
  }
}

// Helper hook for real-time data updates
export function useInsolationLive(city: string, refreshInterval = 300000) { // 5 minutes
  const warsawTime = toZonedTime(new Date(), APP_TIMEZONE)
  const today = warsawTime.toISOString().split('T')[0]
  const currentHour = warsawTime.getHours()

  const { data, error, isLoading, mutate } = useSWR<InsolationResponse>(
    city ? `/api/insolation?city=${city}&startDate=${today}&endDate=${today}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: false, // Reduce unnecessary revalidations
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      dedupingInterval: 60000, // 1 minute deduping for live data
      keepPreviousData: true,
      errorRetryCount: 2,
      errorRetryInterval: 2000,
    }
  )

  const currentData = data?.data.find(item => item.hour === currentHour)
  const todayData = data?.data || []

  return {
    currentInsolation: currentData?.insolation_percentage || 0,
    todayData,
    error,
    isLoading,
    mutate
  }
}