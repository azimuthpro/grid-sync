import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { POLISH_PROVINCES } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const province = searchParams.get('province')
    const city = searchParams.get('city')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const hour = searchParams.get('hour')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const sortBy = searchParams.get('sortBy') || 'date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const viewType = searchParams.get('viewType') // 'hourly', 'daily', 'monthly'
    
    // Validate pagination parameters (skip for chart views)
    if (!viewType && (page < 1 || limit < 1 || limit > 1000)) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Validate viewType parameter
    if (viewType && !['hourly', 'daily', 'monthly'].includes(viewType)) {
      return NextResponse.json(
        { error: 'Invalid viewType. Must be hourly, daily, or monthly' },
        { status: 400 }
      )
    }

    // Validate sort parameters
    const validSortFields = ['date', 'hour', 'city', 'province', 'insolation_percentage']
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort field' },
        { status: 400 }
      )
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: 'Invalid sort order' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()
    
    // Handle chart views with SQL grouping and default date ranges
    if (viewType) {
      return await handleChartData(supabase, viewType, { province, city, startDate, endDate, hour })
    }
    
    // Handle table view with pagination
    let query = supabase
      .from('insolation_data')
      .select('*')

    // Apply filters
    if (province && province !== 'all') {
      if (!POLISH_PROVINCES.includes(province as typeof POLISH_PROVINCES[number])) {
        return NextResponse.json(
          { error: 'Invalid province' },
          { status: 400 }
        )
      }
      query = query.eq('province', province)
    }

    if (city && city !== 'all') {
      query = query.eq('city', city)
    }

    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    if (hour !== null && hour !== '') {
      const hourNum = parseInt(hour)
      if (hourNum >= 0 && hourNum <= 23) {
        query = query.eq('hour', hourNum)
      }
    }

    // Get total count for pagination (without applying filters for now)
    const { count } = await supabase
      .from('insolation_data')
      .select('*', { count: 'exact', head: true })

    // Apply sorting and pagination
    const offset = (page - 1) * limit
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: {
        province,
        city,
        startDate,
        endDate,
        hour
      },
      sorting: {
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to handle chart data with SQL grouping
async function handleChartData(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  viewType: string,
  filters: {
    province?: string | null
    city?: string | null
    startDate?: string | null
    endDate?: string | null
    hour?: string | null
  }
) {
  const now = new Date()
  let defaultStartDate: string
  let defaultEndDate: string
  
  // Get the latest date from database
  const { data: latestRecord } = await supabase
    .from('insolation_data')
    .select('date')
    .order('date', { ascending: false })
    .limit(1)
    .single()
  
  const lastDateInDb = latestRecord?.date || now.toISOString().split('T')[0]
  
  // Set default date ranges based on viewType
  switch (viewType) {
    case 'hourly':
      // Last 24 hours ending at the last date in database
      const endDate = new Date(lastDateInDb)
      defaultStartDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      defaultEndDate = lastDateInDb
      break
    case 'daily':
      // Last 7 days ending at the last date in database
      const endDateDaily = new Date(lastDateInDb)
      endDateDaily.setDate(endDateDaily.getDate() - 6) // Go back 6 days to get 7 days total
      defaultStartDate = endDateDaily.toISOString().split('T')[0]
      defaultEndDate = lastDateInDb
      break
    case 'monthly':
      // Last 12 months ending at the last date in database
      const endDateMonthly = new Date(lastDateInDb)
      const startMonth = new Date(endDateMonthly.getFullYear(), endDateMonthly.getMonth() - 11, 1)
      defaultStartDate = startMonth.toISOString().split('T')[0]
      defaultEndDate = lastDateInDb
      break
    default:
      return NextResponse.json(
        { error: 'Invalid viewType' },
        { status: 400 }
      )
  }
  
  // Use provided dates or defaults
  const startDate = filters.startDate || defaultStartDate
  const endDate = filters.endDate || defaultEndDate
  
  try {
    let data: unknown[]
    
    if (viewType === 'hourly') {
      // Hourly view - group by hour and calculate average
      let baseQuery = supabase
        .from('insolation_data')
        .select('hour, date, insolation_percentage, city, province')
        .gte('date', startDate)
        .lte('date', endDate)
      
      // Apply filters
      if (filters.province && filters.province !== 'all') {
        baseQuery = baseQuery.eq('province', filters.province)
      }
      if (filters.city && filters.city !== 'all') {
        baseQuery = baseQuery.eq('city', filters.city)
      }
      if (filters.hour !== null && filters.hour !== '') {
        const hourNum = parseInt(filters.hour!)
        if (hourNum >= 0 && hourNum <= 23) {
          baseQuery = baseQuery.eq('hour', hourNum)
        }
      }
      
      const { data: rawData, error } = await baseQuery
      if (error) throw error
      
      // Group by hour (0-23) and calculate averages
      const hourlyMap = new Map()
      rawData?.forEach((item: Record<string, unknown>) => {
        const hour = item.hour as number
        const existing = hourlyMap.get(hour) || {
          hour,
          sum: 0,
          count: 0,
          dates: new Set(),
          cities: new Set(),
          provinces: new Set()
        }
        existing.sum += item.insolation_percentage as number
        existing.count += 1
        existing.dates.add(item.date as string)
        existing.cities.add(item.city as string)
        if (item.province) existing.provinces.add(item.province as string)
        hourlyMap.set(hour, existing)
      })
      
      // Convert to array and calculate averages
      data = Array.from(hourlyMap.values()).map(group => ({
        hour: group.hour,
        date: `${String(group.hour).padStart(2, '0')}:00`, // Format for display
        insolation_percentage: group.sum / group.count,
        count: group.count,
        dates: group.dates.size,
        cities: group.cities.size,
        provinces: group.provinces.size
      })).sort((a, b) => a.hour - b.hour)
      
    } else if (viewType === 'daily') {
      // Daily view - group by date
      let baseQuery = supabase
        .from('insolation_data')
        .select('date, insolation_percentage, city, province')
        .gte('date', startDate)
        .lte('date', endDate)
      
      // Apply filters
      if (filters.province && filters.province !== 'all') {
        baseQuery = baseQuery.eq('province', filters.province)
      }
      if (filters.city && filters.city !== 'all') {
        baseQuery = baseQuery.eq('city', filters.city)
      }
      if (filters.hour !== null && filters.hour !== '') {
        const hourNum = parseInt(filters.hour!)
        if (hourNum >= 0 && hourNum <= 23) {
          baseQuery = baseQuery.eq('hour', hourNum)
        }
      }
      
      const { data: rawData, error } = await baseQuery
      if (error) throw error
      
      // Group by date in JavaScript (since Supabase doesn't support complex aggregations well)
      const groupedData = new Map()
      rawData?.forEach((item: Record<string, unknown>) => {
        const existing = groupedData.get(item.date as string) || {
          date: item.date as string,
          sum: 0,
          count: 0,
          cities: new Set(),
          provinces: new Set()
        }
        existing.sum += item.insolation_percentage as number
        existing.count += 1
        existing.cities.add(item.city as string)
        if (item.province) existing.provinces.add(item.province as string)
        groupedData.set(item.date as string, existing)
      })
      
      data = Array.from(groupedData.values()).map(group => ({
        date: group.date,
        insolation_percentage: group.sum / group.count,
        count: group.count,
        cities: group.cities.size,
        provinces: group.provinces.size,
        city_list: Array.from(group.cities).slice(0, 3).join(', ') + (group.cities.size > 3 ? ` i ${group.cities.size - 3} więcej` : '')
      })).sort((a, b) => a.date.localeCompare(b.date))
      
    } else if (viewType === 'monthly') {
      // Monthly view - group by month
      let baseQuery = supabase
        .from('insolation_data')
        .select('date, insolation_percentage, city, province')
        .gte('date', startDate)
        .lte('date', endDate)
      
      // Apply filters
      if (filters.province && filters.province !== 'all') {
        baseQuery = baseQuery.eq('province', filters.province)
      }
      if (filters.city && filters.city !== 'all') {
        baseQuery = baseQuery.eq('city', filters.city)
      }
      if (filters.hour !== null && filters.hour !== '') {
        const hourNum = parseInt(filters.hour!)
        if (hourNum >= 0 && hourNum <= 23) {
          baseQuery = baseQuery.eq('hour', hourNum)
        }
      }
      
      const { data: rawData, error } = await baseQuery
      if (error) throw error
      
      // Group by month in JavaScript
      const groupedData = new Map()
      rawData?.forEach((item: Record<string, unknown>) => {
        const monthKey = (item.date as string).substring(0, 7) // YYYY-MM
        const existing = groupedData.get(monthKey) || {
          month: monthKey,
          sum: 0,
          count: 0,
          cities: new Set(),
          provinces: new Set(),
          dates: new Set()
        }
        existing.sum += item.insolation_percentage as number
        existing.count += 1
        existing.cities.add(item.city as string)
        if (item.province) existing.provinces.add(item.province as string)
        existing.dates.add(item.date as string)
        groupedData.set(monthKey, existing)
      })
      
      data = Array.from(groupedData.values()).map(group => ({
        month: group.month,
        date: group.month + '-01', // For sorting
        insolation_percentage: group.sum / group.count,
        count: group.count,
        cities: group.cities.size,
        provinces: group.provinces.size,
        dates: group.dates.size,
        city_list: Array.from(group.cities).slice(0, 3).join(', ') + (group.cities.size > 3 ? ` i ${group.cities.size - 3} więcej` : '')
      })).sort((a, b) => a.month.localeCompare(b.month))
    } else {
      data = []
    }
    
    return NextResponse.json({
      data: data || [],
      viewType,
      dateRange: { startDate, endDate },
      filters: {
        province: filters.province,
        city: filters.city,
        hour: filters.hour
      }
    })
    
  } catch (error) {
    console.error('Chart data query error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}

// POST requests for additional functionality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, province } = body

    if (action === 'getCities') {
      const supabase = createSupabaseServiceClient()
      
      let query = supabase
        .from('insolation_data')
        .select('city')
        .order('city')

      if (province && province !== 'all') {
        query = query.eq('province', province)
      }

      const { data, error } = await query

      if (error) {
        console.error('Database query error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch cities' },
          { status: 500 }
        )
      }

      // Get unique cities
      const uniqueCities = [...new Set(data?.map(item => item.city) || [])]

      return NextResponse.json({
        cities: uniqueCities.sort()
      })
    }

    if (action === 'getStatistics') {
      const supabase = createSupabaseServiceClient()
      
      // Get basic statistics
      const { count: totalRecords } = await supabase
        .from('insolation_data')
        .select('*', { count: 'exact', head: true })

      // Get date range
      const { data: dateRange } = await supabase
        .from('insolation_data')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)

      const { data: oldestDate } = await supabase
        .from('insolation_data')
        .select('date')
        .order('date', { ascending: true })
        .limit(1)

      // Get unique cities and provinces
      const { data: cities } = await supabase
        .from('insolation_data')
        .select('city')

      const { data: provinces } = await supabase
        .from('insolation_data')
        .select('province')

      const uniqueCities = [...new Set(cities?.map(item => item.city) || [])]
      const uniqueProvinces = [...new Set(provinces?.map(item => item.province) || [])]

      return NextResponse.json({
        totalRecords: totalRecords || 0,
        uniqueCities: uniqueCities.length,
        uniqueProvinces: uniqueProvinces.length,
        latestDate: dateRange?.[0]?.date || null,
        oldestDate: oldestDate?.[0]?.date || null,
        availableProvinces: uniqueProvinces.sort(),
        availableCities: uniqueCities.sort()
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}