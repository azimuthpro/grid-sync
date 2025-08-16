'use client'

import { useState, useCallback, useMemo } from 'react'
import { ConsumptionCell } from './ConsumptionCell'
import { DAYS_OF_WEEK, HOURS_OF_DAY, calculateDailyTotals, formatConsumption } from '@/lib/utils/consumption'
import type { ConsumptionGridData } from '@/lib/utils/consumption'

interface ConsumptionGridProps {
  gridData: ConsumptionGridData
  onDataChange: (gridData: ConsumptionGridData) => void
  isLoading?: boolean
  maxValue?: number
}

interface SelectedCell {
  day: number
  hour: number
}

export function ConsumptionGrid({
  gridData,
  onDataChange,
  isLoading = false,
  maxValue = 5
}: ConsumptionGridProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null)
  const [editingCell, setEditingCell] = useState<SelectedCell | null>(null)

  const dailyTotals = useMemo(() => calculateDailyTotals(gridData), [gridData])

  const handleCellValueChange = useCallback((day: number, hour: number, value: number) => {
    const newGridData = {
      ...gridData,
      [`${day}_${hour}`]: value
    }
    onDataChange(newGridData)
  }, [gridData, onDataChange])

  const handleCellSelect = useCallback((day: number, hour: number) => {
    setSelectedCell({ day, hour })
  }, [])

  const handleEditStart = useCallback((day: number, hour: number) => {
    setEditingCell({ day, hour })
  }, [])

  const handleEditEnd = useCallback(() => {
    setEditingCell(null)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Ładowanie wzorca zużycia...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 overflow-auto">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Tygodniowy wzorzec zużycia energii
        </h3>
        <p className="text-sm text-gray-400">
          Kliknij komórkę aby edytować zużycie dla konkretnej godziny
        </p>
      </div>

      <div className="grid grid-cols-8 gap-2 min-w-max">
        {/* Header row with day names */}
        <div className="text-sm font-medium text-gray-400 text-center py-2">
          Godzina
        </div>
        {DAYS_OF_WEEK.map((dayName, dayIndex) => (
          <div key={dayIndex} className="text-center">
            <div className="text-sm font-medium text-gray-300 mb-1">
              {dayName}
            </div>
            <div className="text-xs text-gray-400">
              {formatConsumption(dailyTotals[dayIndex])}
            </div>
          </div>
        ))}

        {/* Grid rows for each hour */}
        {HOURS_OF_DAY.map((hour) => (
          <div key={hour} className="contents">
            {/* Hour label */}
            <div className="text-sm text-gray-400 text-center py-2 font-mono">
              {hour.toString().padStart(2, '0')}:00
            </div>
            
            {/* Consumption cells for each day */}
            {DAYS_OF_WEEK.map((_, dayIndex) => {
              const cellKey = `${dayIndex}_${hour}`
              const value = gridData[cellKey] || 0
              const isSelected = selectedCell?.day === dayIndex && selectedCell?.hour === hour
              const isEditing = editingCell?.day === dayIndex && editingCell?.hour === hour

              return (
                <div key={cellKey} className="flex justify-center">
                  <ConsumptionCell
                    day={dayIndex}
                    hour={hour}
                    value={value}
                    isSelected={isSelected}
                    isEditing={isEditing}
                    onValueChange={handleCellValueChange}
                    onEditStart={handleEditStart}
                    onEditEnd={handleEditEnd}
                    onCellSelect={handleCellSelect}
                    maxValue={maxValue}
                  />
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-2">Legenda intensywności zużycia:</div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-800"></div>
            <span className="text-gray-400">Brak zużycia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-900"></div>
            <span className="text-gray-400">Niskie (0-1 kWh)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-700"></div>
            <span className="text-gray-400">Umiarkowane (1-2 kWh)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-600"></div>
            <span className="text-gray-400">Średnie (2-3 kWh)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500"></div>
            <span className="text-gray-400">Wysokie (3-4 kWh)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-400">Bardzo wysokie (4+ kWh)</span>
          </div>
        </div>
      </div>

      {/* Selection info */}
      {selectedCell && (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg text-sm">
          <div className="text-gray-300">
            Wybrana komórka: {DAYS_OF_WEEK[selectedCell.day]}, {selectedCell.hour}:00
          </div>
          <div className="text-gray-400">
            Zużycie: {formatConsumption(gridData[`${selectedCell.day}_${selectedCell.hour}`] || 0)}
          </div>
        </div>
      )}
    </div>
  )
}