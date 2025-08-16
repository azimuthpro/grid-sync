import useSWR from 'swr'
import { useState, useCallback } from 'react'
import type { InsolationData } from '@/types'

interface InsolationFilters {
  province?: string
  city?: string
  startDate?: string
  endDate?: string
  hour?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
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

interface InsolationStatistics {
  totalRecords: number
  uniqueCities: number
  uniqueProvinces: number
  latestDate: string | null
  oldestDate: string | null
  availableProvinces: string[]
  availableCities: string[]
}

const fetcher = async (url: string): Promise<InsolationResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch insolation data')
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
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      dedupingInterval: 60000, // 60 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000,
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

export function useInsolationStatistics() {
  const [isLoading, setIsLoading] = useState(false)
  const [statistics, setStatistics] = useState<InsolationStatistics | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStatistics = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insolation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getStatistics'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      setStatistics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics')
      setStatistics(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    statistics,
    isLoading,
    error,
    fetchStatistics
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
  const today = new Date().toISOString().split('T')[0]
  const currentHour = new Date().getHours()

  const { data, error, isLoading, mutate } = useSWR<InsolationResponse>(
    city ? `/api/insolation?city=${city}&startDate=${today}&endDate=${today}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
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