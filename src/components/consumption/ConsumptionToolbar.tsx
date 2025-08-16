'use client'

import { useState } from 'react'
import { Copy, Clipboard, FileDown, FileUp, RotateCcw, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  copyDayPattern, 
  fillHourPattern, 
  generateDefaultWeekdayPattern, 
  DAYS_OF_WEEK,
  calculateWeeklyTotal,
  formatConsumption
} from '@/lib/utils/consumption'
import type { ConsumptionGridData } from '@/lib/utils/consumption'

interface ConsumptionToolbarProps {
  gridData: ConsumptionGridData
  onDataChange: (gridData: ConsumptionGridData) => void
  onSave: () => void
  isSaving: boolean
  hasUnsavedChanges: boolean
}

export function ConsumptionToolbar({
  gridData,
  onDataChange,
  onSave,
  isSaving,
  hasUnsavedChanges
}: ConsumptionToolbarProps) {
  const [copySourceDay, setCopySourceDay] = useState<string>('')
  const [copyTargetDay, setCopyTargetDay] = useState<string>('')
  const [fillHour, setFillHour] = useState<string>('')
  const [fillValue, setFillValue] = useState<string>('')

  const weeklyTotal = calculateWeeklyTotal(gridData)

  const handleCopyDay = () => {
    if (copySourceDay && copyTargetDay) {
      const sourceDay = parseInt(copySourceDay)
      const targetDay = parseInt(copyTargetDay)
      const newData = copyDayPattern(gridData, sourceDay, targetDay)
      onDataChange(newData)
    }
  }

  const handleFillHour = () => {
    if (fillHour && fillValue) {
      const hour = parseInt(fillHour)
      const value = parseFloat(fillValue)
      if (!isNaN(value) && value >= 0) {
        const newData = fillHourPattern(gridData, hour, value)
        onDataChange(newData)
      }
    }
  }

  const handleLoadDefaultPattern = () => {
    const defaultPattern = generateDefaultWeekdayPattern()
    onDataChange(defaultPattern)
  }

  const handleClearAll = () => {
    if (confirm('Czy na pewno chcesz wyczyścić wszystkie dane? Ta operacja nie może być cofnięta.')) {
      const emptyData: ConsumptionGridData = {}
      for (let day = 0; day <= 6; day++) {
        for (let hour = 0; hour <= 23; hour++) {
          emptyData[`${day}_${hour}`] = 0
        }
      }
      onDataChange(emptyData)
    }
  }

  const handleExportCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,'
      + 'Dzień,Godzina,Zużycie (kWh)\n'
      + Object.entries(gridData)
        .map(([key, value]) => {
          const [day, hour] = key.split('_')
          return `${DAYS_OF_WEEK[parseInt(day)]},${hour}:00,${value}`
        })
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'wzorzec_zuzycia.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      {/* Summary and Save */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-lg font-semibold text-gray-100">
            Narzędzia edycji wzorca
          </div>
          <div className="text-sm text-gray-400">
            Tygodniowe zużycie: <span className="font-mono text-gray-300">{formatConsumption(weeklyTotal)}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={handleLoadDefaultPattern}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Wzorzec domyślny
        </Button>

        <Button
          onClick={handleClearAll}
          variant="outline"
          className="flex items-center gap-2 text-red-400 hover:text-red-300"
        >
          <RotateCcw className="h-4 w-4" />
          Wyczyść wszystko
        </Button>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Eksportuj CSV
        </Button>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled
        >
          <FileUp className="h-4 w-4" />
          Importuj CSV
        </Button>
      </div>

      {/* Copy Day Pattern */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Kopiuj wzorzec dnia</h4>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Z:</span>
            <Select value={copySourceDay} onValueChange={setCopySourceDay}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Wybierz dzień" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Do:</span>
            <Select value={copyTargetDay} onValueChange={setCopyTargetDay}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Wybierz dzień" />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCopyDay}
            disabled={!copySourceDay || !copyTargetDay}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Kopiuj
          </Button>
        </div>
      </div>

      {/* Fill Hour Pattern */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">Wypełnij godzinę we wszystkie dni</h4>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Godzina:</span>
            <Select value={fillHour} onValueChange={setFillHour}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="00" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}:00
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Wartość:</span>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={fillValue}
              onChange={(e) => setFillValue(e.target.value)}
              placeholder="0.0"
              className="w-20"
            />
            <span className="text-sm text-gray-400">kWh</span>
          </div>

          <Button
            onClick={handleFillHour}
            disabled={!fillHour || !fillValue}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Wypełnij
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Wskazówki:</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Kliknij komórkę aby edytować wartość zużycia dla konkretnej godziny</li>
          <li>• Użyj wzorca domyślnego jako punktu startowego</li>
          <li>• Kopiuj wzorce między dniami aby przyspieszyć konfigurację</li>
          <li>• Kolory komórek odzwierciedlają intensywność zużycia energii</li>
        </ul>
      </div>
    </div>
  )
}