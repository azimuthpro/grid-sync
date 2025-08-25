import { format, addHours, isBefore, isAfter, addDays } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { APP_TIMEZONE } from '@/types'
import type { 
  MWEReportData, 
  MWEHourlyData, 
  MWEValidationResult,
  UserLocation,
  ConsumptionProfile,
  InsolationData
} from '@/types'
import { MWE_CONSTRAINTS } from '@/types'
import { calculatePVProduction } from './pv-production'

/**
 * Format number value according to MWE specifications
 * Uses Polish decimal notation (comma separator)
 */
export function formatMWEValue(value: number, convertKWtoMW: boolean = false): string {
  let processedValue = value
  
  // Convert kW to MW if requested
  if (convertKWtoMW) {
    processedValue = value / 1000
  }
  
  if (processedValue === 0) return '0,000'
  
  // Round to 3 decimal places max
  const rounded = Math.round(processedValue * 1000) / 1000
  
  // Convert to Polish decimal format with 3 decimal places
  const formatted = rounded.toFixed(3).replace('.', ',')
  
  return formatted
}

/**
 * Format datetime for MWE CSV format
 * Handles DST transitions with 'A' suffix
 */
export function formatMWEDateTime(date: Date): string {
  // Use the date directly - it's already in the correct local time
  // No need to apply timezone conversion as the dates are created in local context
  
  // Check for DST transition (spring forward)
  const nextHour = addHours(date, 1)
  
  // If hour difference is not 1, we're in DST transition
  const hourDiff = nextHour.getHours() - date.getHours()
  const isDSTTransition = hourDiff !== 1 && hourDiff !== -23
  
  const formatted = format(date, 'dd-MM-yyyy HH:mm')
  
  // Add 'A' suffix for summer time during DST transition
  return isDSTTransition && date.getHours() === 2 ? `${formatted}A` : formatted
}

/**
 * Generate MWE header lines
 */
export function generateMWEHeader(mweCode: string): string[] {
  return [
    `#KOD_MWE;${mweCode}`,
    'DATA I CZAS OD;PPLAN;PAUTO'
  ]
}

/**
 * Generate hourly data lines for MWE CSV
 */
export function generateMWEDataLines(data: MWEHourlyData[]): string[] {
  return data.map(item => {
    const parts = [item.datetime, formatMWEValue(item.pplan, true)]
    if (item.pauto !== undefined) {
      parts.push(formatMWEValue(item.pauto, true))
    }
    return parts.join(';')
  })
}

/**
 * Generate complete MWE CSV content
 */
export function generateMWECSV(reportData: MWEReportData): string {
  const header = generateMWEHeader(reportData.mwe_code)
  const dataLines = generateMWEDataLines(reportData.data)
  
  const lines = [...header, ...dataLines]
  return lines.join('\n')
}

/**
 * Calculate PPLAN value from PV production data
 */
export function calculatePPLAN(
  location: UserLocation,
  date: Date,
  hour: number,
  insolationData: InsolationData[]
): number {
  // Use toZonedTime to get the correct local date in APP_TIMEZONE
  const localDate = toZonedTime(date, APP_TIMEZONE)
  const dateStr = localDate.toISOString().split('T')[0] // yyyy-mm-dd format
  
  // First try exact match
  let insolationEntry = insolationData.find(
    entry => entry.city === location.city && 
             entry.date === dateStr && 
             entry.hour === hour
  )
  
  // If no exact match, try to find data for the same hour on a similar date
  if (!insolationEntry) {
    // Look for data within ±7 days
    const targetTime = new Date(date)
    const fallbackCandidates = insolationData.filter(
      entry => entry.city === location.city && entry.hour === hour
    ).sort((a, b) => {
      const aDate = new Date(a.date + 'T00:00:00')
      const bDate = new Date(b.date + 'T00:00:00')
      const aDiff = Math.abs(aDate.getTime() - targetTime.getTime())
      const bDiff = Math.abs(bDate.getTime() - targetTime.getTime())
      return aDiff - bDiff
    })
    
    insolationEntry = fallbackCandidates[0]
  }
  
  if (!insolationEntry) {
    // As last resort, try to get average for the hour across available data
    const hourData = insolationData.filter(
      entry => entry.city === location.city && entry.hour === hour
    )
    
    if (hourData.length > 0) {
      const avgInsolation = hourData.reduce((sum, entry) => sum + entry.insolation_percentage, 0) / hourData.length
      return calculatePVProduction(
        location.pv_power_kwp,
        avgInsolation,
        location.system_losses
      )
    }
    
    return 0 // No insolation data available at all
  }
  
  // Calculate production using PV power and insolation percentage
  return calculatePVProduction(
    location.pv_power_kwp,
    insolationEntry.insolation_percentage,
    location.system_losses
  )
}

/**
 * Calculate PAUTO value from production and consumption
 * PAUTO represents auto-generation (surplus energy after consumption)
 */
export function calculatePAUTO(
  pplan: number,
  consumption: number
): number {
  // PAUTO = PPLAN - consumption, minimum 0 (no negative values)
  return Math.max(0, pplan - consumption)
}

/**
 * Get consumption for specific day/hour from consumption profiles
 */
export function getConsumptionForDateTime(
  date: Date,
  hour: number,
  consumptionProfiles: ConsumptionProfile[]
): number {
  const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
  
  const profile = consumptionProfiles.find(
    p => p.day_of_week === dayOfWeek && p.hour === hour
  )
  
  return profile?.consumption_kwh || 0
}

/**
 * Generate date range for MWE report
 */
export function generateDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  let currentDate = new Date(startDate)
  
  while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
    dates.push(new Date(currentDate))
    currentDate = addDays(currentDate, 1)
  }
  
  return dates
}

/**
 * Generate hourly datetime range for MWE report
 */
export function generateHourlyDateTimeRange(startDate: Date, endDate: Date): Date[] {
  const datetimes: Date[] = []
  let currentDateTime = new Date(startDate)
  currentDateTime.setHours(0, 0, 0, 0) // Start at midnight
  
  const endDateTime = new Date(endDate)
  endDateTime.setHours(23, 0, 0, 0) // End at 23:00
  
  while (isBefore(currentDateTime, endDateTime) || currentDateTime.getTime() === endDateTime.getTime()) {
    datetimes.push(new Date(currentDateTime))
    currentDateTime = addHours(currentDateTime, 1)
  }
  
  return datetimes
}

/**
 * Validate MWE report data according to specifications
 */
export function validateMWEReport(reportData: MWEReportData): MWEValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  // Validate MWE code
  if (!reportData.mwe_code || reportData.mwe_code.trim().length === 0) {
    errors.push('Kod MWE jest wymagany')
  }
  
  // Validate data presence
  if (!reportData.data || reportData.data.length === 0) {
    errors.push('Brak danych do wygenerowania raportu')
  }
  
  // Check date/time constraints
  const now = new Date()
  const futureLimit = addDays(now, MWE_CONSTRAINTS.FUTURE_DAYS_LIMIT)
  
  reportData.data.forEach((item, index) => {
    // Parse datetime from MWE format
    const dateMatch = item.datetime.match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/)
    if (!dateMatch) {
      errors.push(`Nieprawidłowy format daty w wierszu ${index + 3}: ${item.datetime}`)
      return
    }
    
    const [, day, month, year, hour, minute] = dateMatch
    const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute))
    
    
    // Check if date is too far in the future
    if (isAfter(itemDate, futureLimit)) {
      errors.push(`Data przekracza limit 30 dni w przyszłość w wierszu ${index + 3}: ${item.datetime}`)
    }
    
    // Validate PPLAN value (convert kW to MW for validation)
    const pplanMW = item.pplan / 1000
    if (item.pplan < 0) {
      errors.push(`PPLAN musi być >= 0 w wierszu ${index + 3}`)
    }
    
    if (pplanMW > 9.999) {
      errors.push(`PPLAN przekracza maksymalną wartość 9,999 MW w wierszu ${index + 3}`)
    }
    
    // Validate PAUTO value if present
    if (item.pauto !== undefined) {
      const pautoMW = item.pauto / 1000
      if (item.pauto < 0) {
        errors.push(`PAUTO musi być >= 0 w wierszu ${index + 3}`)
      }
      
      if (item.pauto > item.pplan) {
        errors.push(`PAUTO musi być <= PPLAN w wierszu ${index + 3}`)
      }
      
      if (pautoMW > 9.999) {
        errors.push(`PAUTO przekracza maksymalną wartość 9,999 MW w wierszu ${index + 3}`)
      }
    }
  })
  
  // Check for duplicate datetimes
  const datetimes = reportData.data.map(item => item.datetime)
  const uniqueDatetimes = new Set(datetimes)
  if (datetimes.length !== uniqueDatetimes.size) {
    errors.push('Wykryto duplikaty dat i godzin w danych')
  }
  
  // Check chronological order
  const sortedData = [...reportData.data].sort((a, b) => a.datetime.localeCompare(b.datetime))
  const isOrdered = reportData.data.every((item, index) => item.datetime === sortedData[index].datetime)
  if (!isOrdered) {
    warnings.push('Dane nie są uporządkowane chronologicznie')
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Generate MWE filename
 */
export function generateMWEFilename(mweCode: string, startDate: Date, endDate: Date): string {
  const startStr = format(startDate, 'ddMMyyyy')
  const endStr = format(endDate, 'ddMMyyyy')
  
  let filename = `${mweCode}_${startStr}-${endStr}.csv`
  
  // Ensure filename doesn't exceed 50 characters
  if (filename.length > MWE_CONSTRAINTS.MAX_FILENAME_LENGTH) {
    const maxCodeLength = MWE_CONSTRAINTS.MAX_FILENAME_LENGTH - '_DDMMYYYY-DDMMYYYY.csv'.length
    const truncatedCode = mweCode.substring(0, maxCodeLength)
    filename = `${truncatedCode}_${startStr}-${endStr}.csv`
  }
  
  return filename
}

/**
 * Estimate CSV file size in bytes
 */
export function estimateCSVSize(reportData: MWEReportData): number {
  const csv = generateMWECSV(reportData)
  return new Blob([csv], { type: 'text/csv;charset=utf-8' }).size
}

/**
 * Check if CSV file size exceeds MWE limits
 */
export function validateFileSize(reportData: MWEReportData): boolean {
  const sizeInBytes = estimateCSVSize(reportData)
  const sizeInMB = sizeInBytes / (1024 * 1024)
  return sizeInMB <= MWE_CONSTRAINTS.MAX_FILE_SIZE_MB
}