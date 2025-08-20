import { z } from 'zod';
import { POLISH_CITIES_WITH_PROVINCES } from '@/types';

// Branded types for better type safety
export const UserIdSchema = z.string().brand('UserId');
export const LocationIdSchema = z.string().brand('LocationId');

// Location schema
export const locationSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  name: z
    .string()
    .min(1, 'Nazwa lokalizacji jest wymagana')
    .max(50, 'Nazwa nie może być dłuższa niż 50 znaków'),
  city: z.string().min(1, 'Miasto jest wymagane'),
  pv_power_kwp: z
    .number()
    .or(z.string().pipe(z.coerce.number()))
    .pipe(
      z
        .number()
        .positive('Moc instalacji musi być większa od 0')
        .max(1000, 'Moc instalacji nie może być większa niż 1000 kWp')
    ),
  system_losses: z
    .number()
    .or(z.string().pipe(z.coerce.number()))
    .pipe(
      z
        .number()
        .min(1, 'Sprawność systemu musi być co najmniej 1%')
        .max(100, 'Sprawność systemu nie może być większa niż 100%')
    )
    .optional(),
  mwe_code: z
    .string()
    .max(100, 'Kod MWE nie może być dłuższy niż 100 znaków')
    .optional()
    .or(z.literal(''))
    .transform(value => value === '' ? undefined : value),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createLocationSchema = locationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateLocationSchema = locationSchema.partial().omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true,
});

// Consumption profile schema
export const consumptionProfileSchema = z.object({
  id: z.string().optional(),
  location_id: z.string(),
  day_of_week: z
    .number()
    .or(z.string().pipe(z.coerce.number()))
    .pipe(
      z
        .number()
        .int()
        .min(0, 'Dzień tygodnia musi być między 0-6')
        .max(6, 'Dzień tygodnia musi być między 0-6')
    ),
  hour: z
    .number()
    .or(z.string().pipe(z.coerce.number()))
    .pipe(
      z
        .number()
        .int()
        .min(0, 'Godzina musi być między 0-23')
        .max(23, 'Godzina musi być między 0-23')
    ),
  consumption_kwh: z
    .number()
    .or(z.string().pipe(z.coerce.number()))
    .pipe(
      z
        .number()
        .nonnegative('Zużycie energii nie może być ujemne')
        .max(1000, 'Zużycie energii nie może być większe niż 1000 kWh')
    ),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const createConsumptionProfileSchema = consumptionProfileSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Batch consumption profile update
export const batchConsumptionUpdateSchema = z.object({
  location_id: z.string(),
  profiles: z
    .array(
      z.object({
        day_of_week: z.number().int().min(0).max(6),
        hour: z.number().int().min(0).max(23),
        consumption_kwh: z.number().nonnegative().max(100),
      })
    )
    .min(1, 'Wymagany jest co najmniej jeden profil zużycia'),
});

// Insolation data schema
export const insolationDataSchema = z.object({
  id: z.number().int().positive().optional(),
  city: z.string().min(1, 'Miasto jest wymagane'),
  province: z.string().min(1, 'Województwo jest wymagane'),
  date: z.date().or(z.string().pipe(z.coerce.date())),
  hour: z
    .number()
    .int()
    .min(0, 'Godzina musi być między 0-23')
    .max(23, 'Godzina musi być między 0-23'),
  insolation_percentage: z
    .number()
    .min(0, 'Procent nasłonecznienia nie może być ujemny')
    .max(100, 'Procent nasłonecznienia nie może być większy niż 100'),
  created_at: z.string().optional(),
});

export const createInsolationDataSchema = insolationDataSchema.omit({
  id: true,
  created_at: true,
});

// Report generation schema
export const reportGenerationSchema = z
  .object({
    location_id: z.string(),
    start_date: z.date().or(z.string()),
    end_date: z.date().or(z.string()),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'Data końcowa musi być późniejsza lub równa dacie początkowej',
    path: ['end_date'],
  });

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres email'),
  password: z.string().min(6, 'Hasło musi mieć co najmniej 6 znaków'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Nieprawidłowy adres email'),
    password: z
      .string()
      .min(6, 'Hasło musi mieć co najmniej 6 znaków')
      .pipe(z.string()), // Using pipe for better validation flow
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są identyczne',
    path: ['confirmPassword'],
  });

// Chat message schema for AI assistant
export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z
    .string()
    .min(1, 'Wiadomość nie może być pusta')
    .max(1000, 'Wiadomość jest zbyt długa'),
  timestamp: z.date().default(() => new Date()),
});

export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Wiadomość jest wymagana')
    .max(1000, 'Wiadomość jest zbyt długa'),
  location_id: z.string().optional(),
  context: z
    .object({
      user_locations: z.array(locationSchema).optional(),
      consumption_profiles: z.array(consumptionProfileSchema).optional(),
    })
    .optional(),
});

// Predefined Polish cities with solar data
export const polishCitiesSchema = z.enum(
  Object.keys(POLISH_CITIES_WITH_PROVINCES) as [string, ...string[]]
);

// Export types from schemas
export type UserId = z.infer<typeof UserIdSchema>;
export type LocationId = z.infer<typeof LocationIdSchema>;
export type LocationSchema = z.infer<typeof locationSchema>;
export type CreateLocationSchema = z.infer<typeof createLocationSchema>;
export type UpdateLocationSchema = z.infer<typeof updateLocationSchema>;
export type ConsumptionProfileSchema = z.infer<typeof consumptionProfileSchema>;
export type CreateConsumptionProfileSchema = z.infer<
  typeof createConsumptionProfileSchema
>;
export type BatchConsumptionUpdateSchema = z.infer<
  typeof batchConsumptionUpdateSchema
>;
export type InsolationDataSchema = z.infer<typeof insolationDataSchema>;
export type CreateInsolationDataSchema = z.infer<
  typeof createInsolationDataSchema
>;
export type ReportGenerationSchema = z.infer<typeof reportGenerationSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;
export type ChatRequestSchema = z.infer<typeof chatRequestSchema>;
export type PolishCities = z.infer<typeof polishCitiesSchema>;
