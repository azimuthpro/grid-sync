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
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
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

// GET /api/insolation/cities - Get cities for a specific province
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