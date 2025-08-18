import type { User } from '@supabase/supabase-js';

// Database types
export interface UserLocation {
  id: string;
  user_id: string;
  name: string;
  city: string;
  pv_power_kwp: number;
  system_losses?: number; // Custom system efficiency factor (0-1), null means use default
  created_at: string;
  updated_at: string;
}

export interface ConsumptionProfile {
  id: string;
  location_id: string;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  consumption_kwh: number;
  created_at: string;
  updated_at: string;
}

export interface InsolationData {
  id: number;
  city: string;
  province: string | null; // Polish province/voivodeship
  date: string;
  hour: number; // 0-23
  insolation_percentage: number; // 0-100
  created_at: string;
}

// UI Component types
export interface EnergyBalance {
  date: string;
  hour: number;
  production_kwh: number;
  consumption_kwh: number;
  balance_kwh: number; // positive = export, negative = import
}

export interface ReportData {
  location: UserLocation;
  start_date: string;
  end_date: string;
  hourly_data: EnergyBalance[];
  summary: {
    total_production: number;
    total_consumption: number;
    total_export: number;
    total_import: number;
    net_balance: number;
  };
}

// Consumption Grid types
export interface ConsumptionGridData {
  [key: string]: number; // key format: "day_hour" e.g., "0_12" for Sunday 12:00
}

export interface ConsumptionGridCell {
  day: number;
  hour: number;
  value: number;
  isEditing?: boolean;
}

// Chart data types
export interface ChartDataPoint {
  time: string;
  production: number;
  consumption: number;
  balance: number;
}

export interface DailyChartData {
  date: string;
  data: ChartDataPoint[];
}

// AI Assistant types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  user_locations?: UserLocation[];
  current_location?: UserLocation;
  consumption_profiles?: ConsumptionProfile[];
  recent_reports?: ReportData[];
}

// Form types
export interface LocationFormData {
  name: string;
  city: string;
  pv_power_kwp: number;
}

export interface ReportFormData {
  location_id: string;
  start_date: Date;
  end_date: Date;
}

// Auth types
export interface AuthUser extends User {
  id: string;
  email?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Store types (Zustand)
export interface LocationStore {
  locations: UserLocation[];
  currentLocation: UserLocation | null;
  loading: boolean;
  error: string | null;
  setLocations: (locations: UserLocation[]) => void;
  setCurrentLocation: (location: UserLocation | null) => void;
  addLocation: (location: UserLocation) => void;
  updateLocation: (id: string, updates: Partial<UserLocation>) => void;
  removeLocation: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface ConsumptionStore {
  profiles: Record<string, ConsumptionProfile[]>; // locationId -> profiles
  loading: boolean;
  error: string | null;
  setProfiles: (locationId: string, profiles: ConsumptionProfile[]) => void;
  updateProfile: (
    locationId: string,
    day: number,
    hour: number,
    consumption: number
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface ReportStore {
  currentReport: ReportData | null;
  reports: ReportData[];
  loading: boolean;
  error: string | null;
  setCurrentReport: (report: ReportData | null) => void;
  addReport: (report: ReportData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Utility types
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeSlot {
  day: DayOfWeek;
  hour: number; // 0-23
}

export interface EnergyCalculationParams {
  pvPowerKwp: number;
  insolationPercentage: number;
  hour: number;
  date: string;
}

export interface WeeklyConsumptionPattern {
  [day: number]: { [hour: number]: number };
}

// Polish provinces
export const POLISH_PROVINCES = [
  'Dolnośląskie',
  'Kujawsko-Pomorskie',
  'Lubelskie',
  'Lubuskie',
  'Łódzkie',
  'Małopolskie',
  'Mazowieckie',
  'Opolskie',
  'Podkarpackie',
  'Podlaskie',
  'Pomorskie',
  'Śląskie',
  'Świętokrzyskie',
  'Warmińsko-Mazurskie',
  'Wielkopolskie',
  'Zachodniopomorskie',
] as const;

// City-Province structure for better organization
export interface CityWithProvince {
  city: string;
  province: string;
}

// Polish cities with their provinces
export const POLISH_CITIES_WITH_PROVINCES: Record<string, string> = {
  Białystok: 'Podlaskie',
  Bydgoszcz: 'Kujawsko-Pomorskie',
  Gdańsk: 'Pomorskie',
  'Gorzów Wielkopolski': 'Lubuskie',
  Katowice: 'Śląskie',
  Kielce: 'Świętokrzyskie',
  Koszalin: 'Zachodniopomorskie',
  Kraków: 'Małopolskie',
  Lublin: 'Lubelskie',
  Olsztyn: 'Warmińsko-Mazurskie',
  Opole: 'Opolskie',
  Poznań: 'Wielkopolskie',
  Rzeszów: 'Podkarpackie',
  Suwałki: 'Podlaskie',
  Szczecin: 'Zachodniopomorskie',
  Toruń: 'Kujawsko-Pomorskie',
  Warszawa: 'Mazowieckie',
  Wrocław: 'Dolnośląskie',
  'Zielona Góra': 'Lubuskie',
  Łódź: 'Łódzkie',
} as const;

export type PolishCity = keyof typeof POLISH_CITIES_WITH_PROVINCES;

// Helper function to get province for a city
export function getProvinceForCity(city: string): string | undefined {
  return POLISH_CITIES_WITH_PROVINCES[city];
}

// Helper function to get formatted city display with province
export function getCityDisplayName(city: string): string {
  const province = getProvinceForCity(city);
  return province ? `${city} (${province})` : city;
}

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// CSV Export types
export interface CSVRow {
  [key: string]: string | number;
}

export interface CSVExportOptions {
  filename: string;
  headers: string[];
  data: CSVRow[];
}

// Solar calculation constants
export const SYSTEM_LOSSES: number = 1; // 0% system losses

// Cron job types
export interface InsolationImageData {
  imageUrl: string;
  percentage: number;
  date: string;
  hour: number;
  cityData: Record<string, number>; // city -> insolation percentage
}

export interface GeminiVisionResponse {
  date: string;
  hour: number;
  cities: Array<{
    name: string;
    province?: string; // Optional as Gemini might not always identify it
    insolation_percentage: number;
  }>;
}

export interface CronJobResult {
  success: boolean;
  processed_images: number;
  failed_images: number;
  database_writes: number;
  errors: string[];
  execution_time_ms: number;
  timestamp: string;
}

export interface InsolationDataInput {
  city: string;
  province: string;
  date: string;
  hour: number;
  insolation_percentage: number;
}

// Application timezone configuration
export const APP_TIMEZONE = 'Europe/Warsaw';

// Production Summary types
export interface LocationProduction {
  locationId: string;
  currentProduction: number;
  dailyProduction: number;
  currentConsumption: number;
  dailyConsumption: number;
  insolationPercentage: number;
  selfConsumptionRate: number;
  energyBalance: number;
}

export interface ProductionSummaryResponse {
  success: boolean;
  data: LocationProduction[];
  metadata: {
    date: string;
    hour: number;
    totalLocations: number;
  };
}
