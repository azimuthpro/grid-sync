'use client'

import { useState } from 'react'
import { 
  ChevronUp, 
  ChevronDown, 
  Table,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { InsolationData } from '@/types'

interface InsolationDataTableProps {
  data: InsolationData[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  onPageChange?: (page: number) => void
  onSortChange?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  sorting?: {
    sortBy: string
    sortOrder: 'asc' | 'desc'
  }
  filters?: Record<string, string | number | undefined>
  className?: string
}

export function InsolationDataTable({
  data,
  pagination,
  onPageChange,
  onSortChange,
  sorting,
  className = ''
}: InsolationDataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleSort = (field: string) => {
    if (!onSortChange) return
    
    const newOrder = sorting?.sortBy === field && sorting.sortOrder === 'asc' ? 'desc' : 'asc'
    onSortChange(field, newOrder)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(data.map((_, index) => index)))
    }
  }

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }


  const getSortIcon = (field: string) => {
    if (sorting?.sortBy !== field) {
      return <MoreHorizontal className="h-4 w-4 text-gray-500" />
    }
    return sorting.sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-400" /> : 
      <ChevronDown className="h-4 w-4 text-blue-400" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL')
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`
  }

  const getInsolationColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-400'
    if (percentage >= 60) return 'text-blue-400'
    if (percentage >= 40) return 'text-amber-400'
    if (percentage >= 20) return 'text-orange-400'
    return 'text-red-400'
  }

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
        <div className="p-8 text-center">
          <Table className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Brak danych do wyświetlenia</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Table className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-100">Dane nasłonecznienia</h3>
            {pagination && (
              <span className="ml-3 text-sm text-gray-400">
                Wyniki {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total}
              </span>
            )}
          </div>
          
          {selectedRows.size > 0 && (
            <span className="text-sm text-gray-400">
              Zaznaczono: {selectedRows.size}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('date')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Data</span>
                  {getSortIcon('date')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('hour')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Godzina</span>
                  {getSortIcon('hour')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('city')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Miasto</span>
                  {getSortIcon('city')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('province')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Województwo</span>
                  {getSortIcon('province')}
                </button>
              </th>
              
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('insolation_percentage')}
                  className="flex items-center space-x-1 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors"
                >
                  <span>Nasłonecznienie (%)</span>
                  {getSortIcon('insolation_percentage')}
                </button>
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-800">
            {data.map((row, index) => (
              <tr 
                key={`${row.id || index}`}
                className={`hover:bg-gray-800/50 transition-colors ${
                  selectedRows.has(index) ? 'bg-blue-950/30' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={() => handleSelectRow(index)}
                    className="rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-300">
                  {formatDate(row.date)}
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-300">
                  {formatHour(row.hour)}
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-300">
                  {row.city}
                </td>
                
                <td className="px-4 py-3 text-sm text-gray-400">
                  {row.province || 'Nieznane'}
                </td>
                
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${getInsolationColor(row.insolation_percentage)}`}>
                    {row.insolation_percentage.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Strona {pagination.page} z {pagination.totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Poprzednia
              </Button>
              
              <div className="flex items-center space-x-1">
                {/* Show page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange?.(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Następna
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}