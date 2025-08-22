import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { Env } from '@/lib/Env.mjs';
import {
  generateMWECSV,
  generateHourlyDateTimeRange,
  calculatePPLAN,
  calculatePAUTO,
  getConsumptionForDateTime,
  formatMWEDateTime,
  validateMWEReport,
  generateMWEFilename,
} from '@/lib/utils/mwe-report';
import type {
  MWEReportData,
  MWEHourlyData,
  UserLocation,
  ConsumptionProfile,
  InsolationData,
} from '@/types';

// Request validation schema
const generateReportSchema = z.object({
  location_id: z.string().uuid(),
  mwe_code: z.string().min(1, 'Kod MWE jest wymagany'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

function getSupabaseUrl() {
  const url = Env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_URL');
  }
  return url;
}

function getSupabaseAnonKey() {
  const key = Env.SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return key;
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The setAll method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = generateReportSchema.parse(body);

    const startDate = new Date(validatedData.start_date);
    const endDate = new Date(validatedData.end_date);

    // Validate date range
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Data końcowa musi być późniejsza niż data początkowa' },
        { status: 400 }
      );
    }

    // Check if date range is not too large (max 31 days)
    const daysDiff = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 31) {
      return NextResponse.json(
        { error: 'Maksymalny zakres dat to 31 dni' },
        { status: 400 }
      );
    }

    // Fetch location data
    const { data: location, error: locationError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('id', validatedData.location_id)
      .eq('user_id', user.id)
      .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: 'Lokalizacja nie została znaleziona' },
        { status: 404 }
      );
    }

    // Fetch consumption profiles for the location
    const { data: consumptionProfiles } = await supabase
      .from('consumption_profiles')
      .select('*')
      .eq('location_id', validatedData.location_id);

    // Fetch insolation data for the date range and city
    // Extend the date range to get more fallback data
    const extendedStartDate = new Date(startDate);
    extendedStartDate.setDate(startDate.getDate() - 7); // Get 7 days before
    const extendedEndDate = new Date(endDate);
    extendedEndDate.setDate(endDate.getDate() + 7); // Get 7 days after

    const { data: insolationData, error: insolationError } = await supabase
      .from('insolation_data')
      .select('*')
      .eq('city', location.city)
      .gte('date', extendedStartDate.toISOString().split('T')[0])
      .lte('date', extendedEndDate.toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('hour', { ascending: true });

    if (insolationError) {
      console.error('Error fetching insolation data:', insolationError);
    }

    // Generate hourly datetime range
    const hourlyDateTimes = generateHourlyDateTimeRange(startDate, endDate);

    // Generate MWE hourly data
    const mweData: MWEHourlyData[] = hourlyDateTimes.map((dateTime) => {
      const hour = dateTime.getHours();

      // Calculate PPLAN from PV production
      const pplan = calculatePPLAN(
        location as UserLocation,
        dateTime,
        hour,
        insolationData as InsolationData[]
      );

      // Get consumption for this datetime
      const consumption = getConsumptionForDateTime(
        dateTime,
        hour,
        consumptionProfiles as ConsumptionProfile[]
      );

      // Always calculate PAUTO as consumption value
      const pauto = calculatePAUTO(pplan, consumption);

      return {
        datetime: formatMWEDateTime(dateTime),
        pplan,
        pauto,
      };
    });

    // Create report data structure
    const reportData: MWEReportData = {
      mwe_code: validatedData.mwe_code,
      data: mweData,
      location: location as UserLocation,
      config: {
        location_id: validatedData.location_id,
        mwe_code: validatedData.mwe_code,
        start_date: startDate,
        end_date: endDate,
      },
    };

    // Validate the report data
    const validation = validateMWEReport(reportData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: 'Błędy walidacji danych raportu',
          validation_errors: validation.errors,
          validation_warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Generate CSV content
    const csvContent = generateMWECSV(reportData);

    // Generate filename
    const filename = generateMWEFilename(
      validatedData.mwe_code,
      startDate,
      endDate
    );

    // Return the CSV data and metadata
    return NextResponse.json({
      success: true,
      data: {
        csv_content: csvContent,
        filename,
        metadata: {
          location: location.name,
          city: location.city,
          mwe_code: validatedData.mwe_code,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_hours: mweData.length,
          validation_warnings: validation.warnings,
        },
      },
    });
  } catch (error) {
    console.error('Error generating MWE report:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Nieprawidłowe dane wejściowe',
          validation_errors: error.issues.map(
            (err) => `${err.path.join('.')}: ${err.message}`
          ),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Wystąpił błąd podczas generowania raportu' },
      { status: 500 }
    );
  }
}

// GET endpoint for report preview/validation
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location_id');

    if (!locationId) {
      return NextResponse.json(
        { error: 'Wymagany parametr location_id' },
        { status: 400 }
      );
    }

    // Fetch location with latest data for preview
    const { data: location, error: locationError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('id', locationId)
      .eq('user_id', user.id)
      .single();

    if (locationError || !location) {
      return NextResponse.json(
        { error: 'Lokalizacja nie została znaleziona' },
        { status: 404 }
      );
    }

    // Get the earliest and latest available dates for this city
    const { data: dateRange } = await supabase
      .from('insolation_data')
      .select('date')
      .eq('city', location.city)
      .order('date', { ascending: true })
      .limit(1);

    const { data: latestDateRange } = await supabase
      .from('insolation_data')
      .select('date')
      .eq('city', location.city)
      .order('date', { ascending: false })
      .limit(1);

    // Check data availability for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const { data: insolationData } = await supabase
      .from('insolation_data')
      .select('date, hour')
      .eq('city', location.city)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .order('hour', { ascending: false })
      .limit(10);

    const { data: consumptionProfiles } = await supabase
      .from('consumption_profiles')
      .select('day_of_week, hour, consumption_kwh')
      .eq('location_id', locationId);

    return NextResponse.json({
      success: true,
      data: {
        location: {
          id: location.id,
          name: location.name,
          city: location.city,
          pv_power_kwp: location.pv_power_kwp,
        },
        data_availability: {
          insolation_samples: insolationData || [],
          consumption_profiles_count: consumptionProfiles?.length || 0,
          has_insolation_data: (insolationData?.length || 0) > 0,
          has_consumption_data: (consumptionProfiles?.length || 0) > 0,
          earliest_date: dateRange?.[0]?.date || null,
          latest_date: latestDateRange?.[0]?.date || null,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching report preview data:', error);
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania danych' },
      { status: 500 }
    );
  }
}
