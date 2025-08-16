'use client'

import { useState } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts'
import { BarChart3, LineChart as LineChartIcon, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { InsolationData } from '@/types'

interface InsolationChartProps {
  data: InsolationData[]
  title?: string
  className?: string
  showComparison?: boolean
}

type ChartType = 'line' | 'bar'
type ViewType = 'hourly' | 'daily' | 'monthly'

export function InsolationChart({ 
  data, 
  title = 'Dane nasłonecznienia',
  className = ''
}: InsolationChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [viewType, setViewType] = useState<ViewType>('hourly')

  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
        <div className="p-6 text-center">
          <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">Brak danych do wyświetlenia</p>
        </div>
      </div>
    )
  }

  // Process data based on view type
  const processedData = (() => {
    switch (viewType) {
      case 'hourly':
        // Group by date and hour
        return data.map(item => ({
          time: `${item.date} ${item.hour.toString().padStart(2, '0')}:00`,
          date: item.date,
          hour: item.hour,
          insolation: item.insolation_percentage,
          city: item.city,
          province: item.province
        })).sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)
          return dateCompare !== 0 ? dateCompare : a.hour - b.hour
        })
      
      case 'daily':
        // Group by date and calculate average
        const dailyMap = new Map<string, { sum: number; count: number; cities: Set<string> }>()
        
        data.forEach(item => {
          const existing = dailyMap.get(item.date) || { sum: 0, count: 0, cities: new Set() }
          existing.sum += item.insolation_percentage
          existing.count += 1
          existing.cities.add(item.city)
          dailyMap.set(item.date, existing)
        })
        
        return Array.from(dailyMap.entries()).map(([date, { sum, count, cities }]) => ({
          time: date,
          date,
          insolation: parseFloat((sum / count).toFixed(2)),
          cities: cities.size,
          count
        })).sort((a, b) => a.date.localeCompare(b.date))
      
      case 'monthly':
        // Group by year-month and calculate average
        const monthlyMap = new Map<string, { sum: number; count: number; cities: Set<string> }>()
        
        data.forEach(item => {
          const monthKey = item.date.substring(0, 7) // YYYY-MM
          const existing = monthlyMap.get(monthKey) || { sum: 0, count: 0, cities: new Set() }
          existing.sum += item.insolation_percentage
          existing.count += 1
          existing.cities.add(item.city)
          monthlyMap.set(monthKey, existing)
        })
        
        return Array.from(monthlyMap.entries()).map(([month, { sum, count, cities }]) => ({
          time: month,
          month,
          insolation: parseFloat((sum / count).toFixed(2)),
          cities: cities.size,
          count
        })).sort((a, b) => a.month.localeCompare(b.month))
      
      default:
        return []
    }
  })()

  // Calculate statistics
  const averageInsolation = processedData.length > 0 
    ? processedData.reduce((sum, item) => sum + item.insolation, 0) / processedData.length
    : 0

  const maxInsolation = Math.max(...processedData.map(item => item.insolation))
  const minInsolation = Math.min(...processedData.map(item => item.insolation))

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: { 
    active?: boolean; 
    payload?: Array<{ payload: Record<string, string | number>; value: number }>; 
    label?: string 
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 shadow-lg">
          <p className="text-gray-200 font-medium">{label}</p>
          <p className="text-blue-400">
            Nasłonecznienie: {payload[0].value.toFixed(1)}%
          </p>
          {data.city && (
            <p className="text-gray-400 text-sm">Miasto: {data.city}</p>
          )}
          {data.cities && (
            <p className="text-gray-400 text-sm">Miast: {data.cities}</p>
          )}
          {data.count && (
            <p className="text-gray-400 text-sm">Pomiarów: {data.count}</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 ${className}`}>
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          
          <div className="flex items-center space-x-2">
            {/* View type selector */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewType('hourly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewType === 'hourly' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Godzinowy
              </button>
              <button
                onClick={() => setViewType('daily')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewType === 'daily' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Dzienny
              </button>
              <button
                onClick={() => setViewType('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewType === 'monthly' 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Miesięczny
              </button>
            </div>

            {/* Chart type selector */}
            <div className="flex space-x-1">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'bar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Średnie</p>
            <p className="text-lg font-bold text-blue-400">{averageInsolation.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Maksimum</p>
            <p className="text-lg font-bold text-emerald-400">{maxInsolation.toFixed(1)}%</p>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Minimum</p>
            <p className="text-lg font-bold text-red-400">{minInsolation.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => {
                    if (viewType === 'hourly') {
                      // Show only time for hourly view
                      return value.split(' ')[1] || value
                    }
                    return value
                  }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={averageInsolation} 
                  stroke="#3B82F6" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.7}
                />
                <Line 
                  type="monotone" 
                  dataKey="insolation" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={processedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  tickFormatter={(value) => {
                    if (viewType === 'hourly') {
                      return value.split(' ')[1] || value
                    }
                    return value
                  }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine 
                  y={averageInsolation} 
                  stroke="#3B82F6" 
                  strokeDasharray="5 5"
                  strokeOpacity={0.7}
                />
                <Bar 
                  dataKey="insolation" 
                  fill="#3B82F6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Data info */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Punktów danych: {processedData.length}</span>
            </div>
            {viewType === 'hourly' && data.length > 0 && (
              <span>
                Zakres: {data[0]?.date} - {data[data.length - 1]?.date}
              </span>
            )}
            <span className="text-blue-400">
              Średnia linia: {averageInsolation.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}