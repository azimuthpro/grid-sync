import type { User } from '@supabase/supabase-js'

// Database types
export interface UserLocation {
  id: string
  user_id: string
  name: string
  city: string
  pv_power_kwp: number
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface ConsumptionProfile {
  id: string
  location_id: string
  day_of_week: number // 0-6 (Sunday-Saturday)
  hour: number // 0-23
  consumption_kwh: number
  created_at: string
  updated_at: string
}

export interface InsolationData {
  id: number
  city: string
  date: string
  hour: number // 0-23
  insolation_percentage: number // 0-100
  created_at: string
}

// UI Component types
export interface EnergyBalance {
  date: string
  hour: number
  production_kwh: number
  consumption_kwh: number
  balance_kwh: number // positive = export, negative = import
}

export interface ReportData {
  location: UserLocation
  start_date: string
  end_date: string
  hourly_data: EnergyBalance[]
  summary: {
    total_production: number
    total_consumption: number
    total_export: number
    total_import: number
    net_balance: number
  }
}

// Consumption Grid types
export interface ConsumptionGridData {
  [key: string]: number // key format: "day_hour" e.g., "0_12" for Sunday 12:00
}

export interface ConsumptionGridCell {
  day: number
  hour: number
  value: number
  isEditing?: boolean
}

// Chart data types
export interface ChartDataPoint {
  time: string
  production: number
  consumption: number
  balance: number
}

export interface DailyChartData {
  date: string
  data: ChartDataPoint[]
}

// AI Assistant types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatContext {
  user_locations?: UserLocation[]
  current_location?: UserLocation
  consumption_profiles?: ConsumptionProfile[]
  recent_reports?: ReportData[]
}

// Form types
export interface LocationFormData {
  name: string
  city: string
  pv_power_kwp: number
  is_primary: boolean
}

export interface ReportFormData {
  location_id: string
  start_date: Date
  end_date: Date
}

// Auth types
export interface AuthUser extends User {
  id: string
  email?: string
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// Store types (Zustand)
export interface LocationStore {
  locations: UserLocation[]
  currentLocation: UserLocation | null
  loading: boolean
  error: string | null
  setLocations: (locations: UserLocation[]) => void
  setCurrentLocation: (location: UserLocation | null) => void
  addLocation: (location: UserLocation) => void
  updateLocation: (id: string, updates: Partial<UserLocation>) => void
  removeLocation: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface ConsumptionStore {
  profiles: Record<string, ConsumptionProfile[]> // locationId -> profiles
  loading: boolean
  error: string | null
  setProfiles: (locationId: string, profiles: ConsumptionProfile[]) => void
  updateProfile: (locationId: string, day: number, hour: number, consumption: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface ReportStore {
  currentReport: ReportData | null
  reports: ReportData[]
  loading: boolean
  error: string | null
  setCurrentReport: (report: ReportData | null) => void
  addReport: (report: ReportData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  addMessage: (message: Omit<ChatMessage, 'id'>) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Utility types
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface TimeSlot {
  day: DayOfWeek
  hour: number // 0-23
}

export interface EnergyCalculationParams {
  pvPowerKwp: number
  insolationPercentage: number
  hour: number
  date: string
}

export interface WeeklyConsumptionPattern {
  [day: number]: { [hour: number]: number }
}

// Polish cities enum
export const POLISH_CITIES = [
  'Warszawa',
  'Kraków', 
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Szczecin',
  'Bydgoszcz',
  'Lublin',
  'Białystok',
  'Katowice',
  'Częstochowa',
  'Radom',
  'Toruń',
  'Kielce',
  'Rzeszów',
  'Gorzów Wielkopolski',
  'Opole',
  'Olsztyn',
  'Zielona Góra',
  'Łódź'
] as const

export type PolishCity = typeof POLISH_CITIES[number]

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// CSV Export types
export interface CSVRow {
  [key: string]: string | number
}

export interface CSVExportOptions {
  filename: string
  headers: string[]
  data: CSVRow[]
}

// Solar calculation constants
export const SOLAR_CONSTANTS = {
  STANDARD_TEST_CONDITIONS: 1000, // W/m²
  PANEL_EFFICIENCY: 0.2, // 20% average efficiency
  SYSTEM_LOSSES: 0.85, // 15% system losses
  INVERTER_EFFICIENCY: 0.95 // 95% inverter efficiency
} as const