import { SYSTEM_LOSSES } from '@/types'

/**
 * Calculate PV production based on installed power and insolation percentage
 */
export function calculatePVProduction(pvPowerKwp: number, insolationPercentage: number, systemLosses?: number): number {
  if (pvPowerKwp <= 0 || insolationPercentage < 0 || insolationPercentage > 100) {
    return 0
  }

  // Convert percentage to decimal
  const insolationFactor = insolationPercentage / 100

  // Calculate theoretical production
  const theoreticalProduction = pvPowerKwp * insolationFactor

  // Apply system efficiency - use custom value or default SYSTEM_LOSSES
  const efficiencyFactor = systemLosses ?? SYSTEM_LOSSES
  const actualProduction = theoreticalProduction * efficiencyFactor

  return parseFloat(actualProduction.toFixed(3))
}

/**
 * Calculate daily PV production from hourly insolation data
 */
export function calculateDailyProduction(pvPowerKwp: number, hourlyInsolationData: number[], systemLosses?: number): number {
  if (pvPowerKwp <= 0 || hourlyInsolationData.length === 0) {
    return 0
  }

  const dailyTotal = hourlyInsolationData.reduce((total, insolationPercentage) => {
    return total + calculatePVProduction(pvPowerKwp, insolationPercentage, systemLosses)
  }, 0)

  return parseFloat(dailyTotal.toFixed(3))
}

/**
 * Calculate monthly PV production estimate based on average daily production
 */
export function calculateMonthlyProductionEstimate(averageDailyProduction: number, daysInMonth: number = 30): number {
  if (averageDailyProduction <= 0) {
    return 0
  }

  return parseFloat((averageDailyProduction * daysInMonth).toFixed(1))
}

/**
 * Calculate annual PV production estimate based on average daily production
 */
export function calculateAnnualProductionEstimate(averageDailyProduction: number): number {
  if (averageDailyProduction <= 0) {
    return 0
  }

  return parseFloat((averageDailyProduction * 365).toFixed(1))
}

/**
 * Determine production status based on current production and potential
 */
export function getProductionStatus(currentProduction: number, maxPotentialProduction: number): {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'offline'
  percentage: number
  color: string
} {
  if (maxPotentialProduction <= 0) {
    return { status: 'offline', percentage: 0, color: 'text-gray-500' }
  }

  const percentage = (currentProduction / maxPotentialProduction) * 100

  if (percentage >= 90) {
    return { status: 'excellent', percentage, color: 'text-emerald-500' }
  } else if (percentage >= 70) {
    return { status: 'good', percentage, color: 'text-blue-500' }
  } else if (percentage >= 40) {
    return { status: 'fair', percentage, color: 'text-amber-500' }
  } else if (percentage > 0) {
    return { status: 'poor', percentage, color: 'text-red-500' }
  } else {
    return { status: 'offline', percentage: 0, color: 'text-gray-500' }
  }
}

/**
 * Format production value for display
 */
export function formatProduction(productionKw: number, unit: 'kW' | 'kWh' = 'kW'): string {
  if (productionKw === 0) {
    return `0 ${unit}`
  }

  if (productionKw < 1) {
    return `${Math.round(productionKw * 1000)} W`
  }

  if (productionKw >= 1000) {
    return `${(productionKw / 1000).toFixed(1)} MW${unit === 'kWh' ? 'h' : ''}`
  }

  return `${productionKw.toFixed(1)} ${unit}`
}

/**
 * Calculate energy balance (production vs consumption)
 */
export function calculateEnergyBalance(production: number, consumption: number): {
  balance: number
  type: 'export' | 'import' | 'balanced'
  percentage: number
} {
  const balance = production - consumption

  if (Math.abs(balance) < 0.1) {
    return { balance, type: 'balanced', percentage: 100 }
  }

  if (balance > 0) {
    const percentage = consumption > 0 ? (production / consumption) * 100 : 100
    return { balance, type: 'export', percentage }
  } else {
    const percentage = production > 0 ? (production / consumption) * 100 : 0
    return { balance: Math.abs(balance), type: 'import', percentage }
  }
}

/**
 * Get production efficiency rating
 */
export function getProductionEfficiency(actualProduction: number, theoreticalProduction: number): {
  efficiency: number
  rating: 'excellent' | 'good' | 'average' | 'poor'
  color: string
} {
  if (theoreticalProduction <= 0) {
    return { efficiency: 0, rating: 'poor', color: 'text-gray-500' }
  }

  const efficiency = (actualProduction / theoreticalProduction) * 100

  if (efficiency >= 90) {
    return { efficiency, rating: 'excellent', color: 'text-emerald-500' }
  } else if (efficiency >= 75) {
    return { efficiency, rating: 'good', color: 'text-blue-500' }
  } else if (efficiency >= 60) {
    return { efficiency, rating: 'average', color: 'text-amber-500' }
  } else {
    return { efficiency, rating: 'poor', color: 'text-red-500' }
  }
}

/**
 * Calculate peak sun hours from insolation data
 */
export function calculatePeakSunHours(hourlyInsolationData: number[]): number {
  const totalInsolation = hourlyInsolationData.reduce((sum, percentage) => sum + percentage, 0)
  return totalInsolation / 100 // Convert percentage to peak sun hours
}