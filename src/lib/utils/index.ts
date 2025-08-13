import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'
import { pl } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string, pattern: string = 'dd.MM.yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  if (!isValid(dateObj)) {
    return 'Invalid Date'
  }
  
  return format(dateObj, pattern, { locale: pl })
}

export function formatDateTime(date: Date | string, pattern: string = 'dd.MM.yyyy HH:mm'): string {
  return formatDate(date, pattern)
}

export function formatDateForAPI(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

// Polish day names
export const DAY_NAMES = [
  'Niedziela',
  'Poniedziałek', 
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota'
] as const

export function getDayName(dayIndex: number): string {
  return DAY_NAMES[dayIndex] || 'Nieznany'
}

// Hour formatting
export function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`
}

export function formatHourRange(hour: number): string {
  const nextHour = hour === 23 ? 0 : hour + 1
  return `${formatHour(hour)}-${formatHour(nextHour)}`
}

// Energy calculations
export function calculateSolarProduction(
  pvPowerKwp: number, 
  insolationPercentage: number
): number {
  // Basic solar production calculation
  // Production = PV Power * Insolation % * System Efficiency
  return (pvPowerKwp * insolationPercentage / 100) * 0.85 // 85% system efficiency
}

export function calculateEnergyBalance(
  production: number, 
  consumption: number
): number {
  // Positive = export to grid, Negative = import from grid
  return production - consumption
}

// Data validation
export function isValidConsumption(value: number): boolean {
  return value >= 0 && value <= 100 // Max 100 kWh per hour seems reasonable
}

export function isValidPvPower(value: number): boolean {
  return value > 0 && value <= 100 // Max 100 kWp for prosumer installations
}

export function isValidHour(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 23
}

export function isValidDayOfWeek(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 6
}

// Grid utilities for consumption patterns
export function getGridKey(day: number, hour: number): string {
  return `${day}_${hour}`
}

export function parseGridKey(key: string): { day: number; hour: number } | null {
  const parts = key.split('_')
  if (parts.length !== 2) return null
  
  const day = parseInt(parts[0], 10)
  const hour = parseInt(parts[1], 10)
  
  if (!isValidDayOfWeek(day) || !isValidHour(hour)) return null
  
  return { day, hour }
}

// Number formatting
export function formatEnergy(kwh: number, decimals: number = 2): string {
  return `${kwh.toFixed(decimals)} kWh`
}

export function formatPower(kwp: number, decimals: number = 1): string {
  return `${kwp.toFixed(decimals)} kWp`
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Array utilities
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = getKey(item)
    groups[key] = groups[key] || []
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export function sumBy<T>(array: T[], getValue: (item: T) => number): number {
  return array.reduce((sum, item) => sum + getValue(item), 0)
}

export function averageBy<T>(array: T[], getValue: (item: T) => number): number {
  if (array.length === 0) return 0
  return sumBy(array, getValue) / array.length
}

// URL utilities
export function createCSVDownloadUrl(csvContent: string): string {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  return url
}

export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return 'Wystąpił nieoczekiwany błąd'
}

// Local storage utilities
export function setLocalStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return defaultValue
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to remove from localStorage:', error)
  }
}

// Debounce utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}