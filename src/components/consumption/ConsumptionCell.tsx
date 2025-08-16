'use client'

import { useState, useRef, useEffect } from 'react'
import { getConsumptionColor, formatConsumption, parseConsumptionValue } from '@/lib/utils/consumption'

interface ConsumptionCellProps {
  day: number
  hour: number
  value: number
  isSelected?: boolean
  isEditing?: boolean
  onValueChange: (day: number, hour: number, value: number) => void
  onEditStart: (day: number, hour: number) => void
  onEditEnd: () => void
  onCellSelect: (day: number, hour: number) => void
  maxValue?: number
}

export function ConsumptionCell({
  day,
  hour,
  value,
  isSelected = false,
  isEditing = false,
  onValueChange,
  onEditStart,
  onEditEnd,
  onCellSelect,
  maxValue = 5
}: ConsumptionCellProps) {
  const [inputValue, setInputValue] = useState(value.toString())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString())
    }
  }, [value, isEditing])

  const handleClick = () => {
    onCellSelect(day, hour)
    if (!isEditing) {
      onEditStart(day, hour)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      setInputValue(value.toString())
      onEditEnd()
    } else if (e.key === 'Tab') {
      handleSubmit()
      // Let the default tab behavior handle navigation
    }
  }

  const handleSubmit = () => {
    const newValue = parseConsumptionValue(inputValue)
    onValueChange(day, hour, newValue)
    onEditEnd()
  }

  const handleBlur = () => {
    handleSubmit()
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="w-12 h-8 text-xs text-center bg-gray-800 border border-blue-500 rounded text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400"
        placeholder="0.0"
      />
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`
        w-12 h-8 text-xs rounded transition-all duration-150 hover:scale-105 hover:shadow-md
        ${getConsumptionColor(value, maxValue)}
        ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1 ring-offset-gray-900' : ''}
        ${value > 0 ? 'text-white' : 'text-gray-400'}
        hover:ring-1 hover:ring-gray-300
      `}
      title={`${hour}:00 - ${formatConsumption(value)}`}
      tabIndex={0}
    >
      {value > 0 ? value.toFixed(1) : ''}
    </button>
  )
}