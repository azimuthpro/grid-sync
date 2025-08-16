import type { ConsumptionProfile } from '@/types'

export const DAYS_OF_WEEK = [
  'Niedziela',
  'Poniedziałek', 
  'Wtorek',
  'Środa',
  'Czwartek',
  'Piątek',
  'Sobota'
] as const

export const HOURS_OF_DAY = Array.from({ length: 24 }, (_, i) => i)

export interface ConsumptionGridData {
  [key: string]: number // key format: "day_hour" e.g., "0_12" for Sunday 12:00
}

export interface ConsumptionCell {
  day: number
  hour: number
  value: number
  isEditing?: boolean
}

// Convert consumption profiles array to grid data object
export function profilesToGridData(profiles: ConsumptionProfile[]): ConsumptionGridData {
  const gridData: ConsumptionGridData = {}
  
  // Initialize all cells with 0
  for (let day = 0; day <= 6; day++) {
    for (let hour = 0; hour <= 23; hour++) {
      gridData[`${day}_${hour}`] = 0
    }
  }
  
  // Fill with actual data
  profiles.forEach(profile => {
    gridData[`${profile.day_of_week}_${profile.hour}`] = profile.consumption_kwh
  })
  
  return gridData
}

// Convert grid data object to consumption profiles array
export function gridDataToProfiles(
  gridData: ConsumptionGridData,
  locationId: string
): Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[] {
  const profiles: Omit<ConsumptionProfile, 'id' | 'created_at' | 'updated_at'>[] = []
  
  for (let day = 0; day <= 6; day++) {
    for (let hour = 0; hour <= 23; hour++) {
      const key = `${day}_${hour}`
      const consumption = gridData[key] || 0
      
      profiles.push({
        location_id: locationId,
        day_of_week: day,
        hour: hour,
        consumption_kwh: consumption
      })
    }
  }
  
  return profiles
}

// Calculate daily totals for a week
export function calculateDailyTotals(gridData: ConsumptionGridData): number[] {
  const dailyTotals = Array(7).fill(0)
  
  for (let day = 0; day <= 6; day++) {
    for (let hour = 0; hour <= 23; hour++) {
      const key = `${day}_${hour}`
      dailyTotals[day] += gridData[key] || 0
    }
  }
  
  return dailyTotals
}

// Calculate weekly total consumption
export function calculateWeeklyTotal(gridData: ConsumptionGridData): number {
  return Object.values(gridData).reduce((sum, value) => sum + value, 0)
}

// Get consumption value for specific day and hour
export function getConsumptionValue(gridData: ConsumptionGridData, day: number, hour: number): number {
  return gridData[`${day}_${hour}`] || 0
}

// Set consumption value for specific day and hour
export function setConsumptionValue(
  gridData: ConsumptionGridData,
  day: number,
  hour: number,
  value: number
): ConsumptionGridData {
  return {
    ...gridData,
    [`${day}_${hour}`]: Math.max(0, value) // Ensure non-negative values
  }
}

// Copy day pattern (all 24 hours) from one day to another
export function copyDayPattern(
  gridData: ConsumptionGridData,
  fromDay: number,
  toDay: number
): ConsumptionGridData {
  const newData = { ...gridData }
  
  for (let hour = 0; hour <= 23; hour++) {
    const fromKey = `${fromDay}_${hour}`
    const toKey = `${toDay}_${hour}`
    newData[toKey] = gridData[fromKey] || 0
  }
  
  return newData
}

// Fill hour pattern (same hour) across all days
export function fillHourPattern(
  gridData: ConsumptionGridData,
  hour: number,
  value: number
): ConsumptionGridData {
  const newData = { ...gridData }
  
  for (let day = 0; day <= 6; day++) {
    const key = `${day}_${hour}`
    newData[key] = Math.max(0, value)
  }
  
  return newData
}

// Fill range of cells with a value
export function fillRange(
  gridData: ConsumptionGridData,
  startDay: number,
  startHour: number,
  endDay: number,
  endHour: number,
  value: number
): ConsumptionGridData {
  const newData = { ...gridData }
  
  for (let day = startDay; day <= endDay; day++) {
    const hourStart = day === startDay ? startHour : 0
    const hourEnd = day === endDay ? endHour : 23
    
    for (let hour = hourStart; hour <= hourEnd; hour++) {
      const key = `${day}_${hour}`
      newData[key] = Math.max(0, value)
    }
  }
  
  return newData
}

// Generate default weekday/weekend patterns
export function generateDefaultWeekdayPattern(): ConsumptionGridData {
  const gridData: ConsumptionGridData = {}
  
  // Default weekday pattern (Monday-Friday)
  const weekdayPattern = [
    0.5, 0.3, 0.2, 0.2, 0.3, 0.8, 2.1, 3.2, // 0-7
    2.8, 2.2, 1.8, 1.5, 1.2, 1.0, 1.0, 1.2, // 8-15
    1.8, 2.5, 3.8, 4.2, 3.5, 2.8, 1.8, 1.2  // 16-23
  ]
  
  // Weekend pattern (Saturday-Sunday) - slightly different
  const weekendPattern = [
    0.8, 0.5, 0.3, 0.3, 0.5, 1.2, 1.8, 2.5, // 0-7
    3.2, 2.8, 2.5, 2.2, 2.0, 1.8, 1.5, 1.8, // 8-15
    2.2, 2.8, 3.5, 4.0, 3.8, 3.2, 2.5, 1.8  // 16-23
  ]
  
  // Apply patterns
  for (let day = 0; day <= 6; day++) {
    const pattern = (day === 0 || day === 6) ? weekendPattern : weekdayPattern
    
    for (let hour = 0; hour <= 23; hour++) {
      gridData[`${day}_${hour}`] = pattern[hour]
    }
  }
  
  return gridData
}

// Get consumption level color for visualization
export function getConsumptionColor(value: number, maxValue: number = 5): string {
  if (value === 0) return 'bg-gray-800'
  
  const intensity = Math.min(value / maxValue, 1)
  
  if (intensity <= 0.2) return 'bg-blue-900'
  if (intensity <= 0.4) return 'bg-blue-700'
  if (intensity <= 0.6) return 'bg-yellow-600'
  if (intensity <= 0.8) return 'bg-orange-500'
  return 'bg-red-500'
}

// Format consumption value for display
export function formatConsumption(value: number): string {
  return value.toFixed(1) + ' kWh'
}

// Validate consumption value
export function isValidConsumption(value: number): boolean {
  return !isNaN(value) && value >= 0 && value <= 100
}

// Parse consumption value from string
export function parseConsumptionValue(input: string): number {
  const parsed = parseFloat(input.replace(',', '.'))
  return isValidConsumption(parsed) ? parsed : 0
}