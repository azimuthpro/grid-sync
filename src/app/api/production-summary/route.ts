import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { calculatePVProduction, calculateDailyProduction } from '@/lib/utils/pv-production'
import { getProvinceForCity } from '@/types'
import type { UserLocation, InsolationData, ConsumptionProfile } from '@/types'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationIds = searchParams.get('locationIds')
    
    if (!locationIds) {
      return NextResponse.json(
        { error: 'Location IDs are required' },
        { status: 400 }
      )
    }

    const locationIdArray = locationIds.split(',')
    const supabase = createSupabaseServiceClient()

    // Get current date and hour
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentHour = now.getHours()

    // Fetch locations data
    const { data: locations, error: locationsError } = await supabase
      .from('user_locations')
      .select('*')
      .in('id', locationIdArray)

    if (locationsError) {
      console.error('Error fetching locations:', locationsError)
      return NextResponse.json(
        { error: 'Failed to fetch locations' },
        { status: 500 }
      )
    }

    if (!locations || locations.length === 0) {
      return NextResponse.json(
        { error: 'No locations found' },
        { status: 404 }
      )
    }

    // Process each location
    const productionPromises = locations.map(async (location: UserLocation) => {
      try {
        const province = getProvinceForCity(location.city)
        
        // Query insolation data for this location's city and current date
        let query = supabase
          .from('insolation_data')
          .select('*')
          .eq('date', currentDate)
          .order('hour', { ascending: true })
        
        if (province) {
          query = query.eq('province', province)
        }
        
        const { data: insolationData, error: insolationError } = await query

        if (insolationError) {
          console.error(`Error fetching insolation data for ${location.city}:`, insolationError)
          // Return zero values if data fetch fails
          return {
            locationId: location.id,
            currentProduction: 0,
            dailyProduction: 0,
            currentConsumption: 0,
            dailyConsumption: 0,
            insolationPercentage: 0,
            selfConsumptionRate: 0,
            energyBalance: 0
          }
        }

        const currentHourData = insolationData?.find((data: InsolationData) => data.hour === currentHour)
        const currentInsolation = currentHourData?.insolation_percentage || 0
        const systemLossesDecimal = location.system_losses ? location.system_losses / 100 : undefined
        const currentProduction = calculatePVProduction(location.pv_power_kwp, currentInsolation, systemLossesDecimal)
        
        // Calculate daily production from available hourly data
        const hourlyInsolationValues = (insolationData || []).map((data: InsolationData) => data.insolation_percentage)
        const dailyProduction = calculateDailyProduction(location.pv_power_kwp, hourlyInsolationValues, systemLossesDecimal)

        // Fetch consumption profiles for this location
        const { data: consumptionProfiles, error: consumptionError } = await supabase
          .from('consumption_profiles')
          .select('*')
          .eq('location_id', location.id)

        let currentConsumption = 0
        let dailyConsumption = 0

        if (!consumptionError && consumptionProfiles) {
          // Get current day of week (0 = Sunday, 1 = Monday, etc.)
          const currentDayOfWeek = now.getDay()
          
          // Find consumption for current hour
          const currentHourProfile = consumptionProfiles.find(
            (profile: ConsumptionProfile) => 
              profile.day_of_week === currentDayOfWeek && profile.hour === currentHour
          )
          currentConsumption = currentHourProfile?.consumption_kwh || 0

          // Calculate daily consumption (sum all hours for today)
          const todayProfiles = consumptionProfiles.filter(
            (profile: ConsumptionProfile) => profile.day_of_week === currentDayOfWeek
          )
          dailyConsumption = todayProfiles.reduce((sum, profile) => sum + profile.consumption_kwh, 0)
        }

        // Calculate efficiency metrics
        const energyBalance = currentProduction - currentConsumption
        const selfConsumptionRate = currentProduction > 0 
          ? Math.min((currentConsumption / currentProduction) * 100, 100)
          : 0

        return {
          locationId: location.id,
          currentProduction,
          dailyProduction,
          currentConsumption,
          dailyConsumption,
          insolationPercentage: currentInsolation,
          selfConsumptionRate,
          energyBalance
        }
      } catch (error) {
        console.error(`Error processing location ${location.name}:`, error)
        return {
          locationId: location.id,
          currentProduction: 0,
          dailyProduction: 0,
          currentConsumption: 0,
          dailyConsumption: 0,
          insolationPercentage: 0,
          selfConsumptionRate: 0,
          energyBalance: 0
        }
      }
    })

    const productionResults = await Promise.all(productionPromises)

    return NextResponse.json({
      success: true,
      data: productionResults,
      metadata: {
        date: currentDate,
        hour: currentHour,
        totalLocations: locations.length
      }
    })

  } catch (error) {
    console.error('Production summary API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}