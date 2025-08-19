import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { POLISH_PROVINCES } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const viewType = searchParams.get('viewType') || 'daily'
    const province = searchParams.get('province')
    const city = searchParams.get('city')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const showForecast = searchParams.get('showForecast') !== 'false'

    // Validate viewType parameter
    if (!['hourly', 'daily', 'monthly'].includes(viewType)) {
      return NextResponse.json(
        { error: 'Invalid viewType. Must be hourly, daily, or monthly' },
        { status: 400 }
      )
    }

    // Validate province parameter
    if (province && province !== 'all' && !POLISH_PROVINCES.includes(province as typeof POLISH_PROVINCES[number])) {
      return NextResponse.json(
        { error: 'Invalid province' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServiceClient()
    
    // Determine default date ranges based on viewType and last date in DB
    const { data: latestRecord } = await supabase
      .from('insolation_data')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()
    
    const lastDateInDb = latestRecord?.date || new Date().toISOString().split('T')[0]
    
    let defaultStartDate: string
    let defaultEndDate: string
    
    switch (viewType) {
      case 'hourly':
        // Last 24 hours ending at the last date in database
        const endDate = new Date(lastDateInDb)
        defaultStartDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        defaultEndDate = lastDateInDb
        break
      case 'daily':
        // Last 7 days ending at the last date in database
        const startDateDaily = new Date(lastDateInDb)
        startDateDaily.setDate(startDateDaily.getDate() - 6)
        defaultStartDate = startDateDaily.toISOString().split('T')[0]
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
    const finalStartDate = startDate || defaultStartDate
    const finalEndDate = endDate || defaultEndDate
    
    
    let functionName: string
    
    // Call appropriate aggregation function based on viewType
    switch (viewType) {
      case 'hourly':
        functionName = 'get_insolation_hourly_avg'
        break
      case 'daily':
        functionName = 'get_insolation_daily_avg'
        break
      case 'monthly':
        functionName = 'get_insolation_monthly_avg'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid viewType' },
          { status: 400 }
        )
    }
    
    const { data: aggregatedData, error } = await supabase
      .rpc(functionName, {
        p_start_date: finalStartDate,
        p_end_date: finalEndDate,
        p_city: city && city !== 'all' ? city : null,
        p_province: province && province !== 'all' ? province : null,
        p_show_forecast: showForecast
      })
    
    if (error) {
      console.error('Database RPC error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch chart data' },
        { status: 500 }
      )
    }
    
    const data = aggregatedData || []
    
    return NextResponse.json({
      data,
      viewType,
      dateRange: { 
        startDate: finalStartDate, 
        endDate: finalEndDate 
      },
      filters: {
        province,
        city,
        showForecast
      },
      meta: {
        functionUsed: functionName,
        recordCount: data.length,
        lastDateInDb
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