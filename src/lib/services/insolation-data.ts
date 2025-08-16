import { createClient } from '@supabase/supabase-js'
import type { InsolationDataInput, GeminiVisionResponse } from '@/types'
import { getProvinceForCity } from '@/types'

export class InsolationDataService {
  private supabase

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration for insolation data service')
    }

    // Use service role key for elevated permissions (bypassing RLS)
    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  /**
   * Upsert single insolation data record
   */
  async upsertInsolationData(data: InsolationDataInput): Promise<void> {
    const { error } = await this.supabase
      .from('insolation_data')
      .upsert({
        city: data.city,
        province: data.province,
        date: data.date,
        hour: data.hour,
        insolation_percentage: data.insolation_percentage
      }, {
        onConflict: 'city,province,date,hour',
        ignoreDuplicates: false // Update existing records
      })

    if (error) {
      console.error('Failed to upsert insolation data:', error)
      throw new Error(`Database upsert failed: ${error.message}`)
    }
  }

  /**
   * Batch upsert multiple insolation data records
   */
  async batchUpsertInsolationData(dataArray: InsolationDataInput[]): Promise<number> {
    if (dataArray.length === 0) {
      return 0
    }

    const records = dataArray.map(data => ({
      city: data.city,
      province: data.province,
      date: data.date,
      hour: data.hour,
      insolation_percentage: data.insolation_percentage
    }))

    const { error, count } = await this.supabase
      .from('insolation_data')
      .upsert(records, {
        onConflict: 'city,province,date,hour',
        ignoreDuplicates: false // Update existing records
      })

    if (error) {
      console.error('Failed to batch upsert insolation data:', error)
      throw new Error(`Batch database upsert failed: ${error.message}`)
    }

    return count || records.length
  }

  /**
   * Deduplicate records and filter out 0% values
   */
  private deduplicateAndFilterRecords(records: InsolationDataInput[]): InsolationDataInput[] {
    // First, filter out 0% values
    const nonZeroRecords = records.filter(record => {
      if (record.insolation_percentage === 0) {
        console.log(`Filtering out 0% record: ${record.city} ${record.province || 'unknown'} ${record.date} ${record.hour}:00`)
        return false
      }
      return true
    })
    
    // Then deduplicate
    const uniqueRecords = new Map<string, InsolationDataInput>()
    const duplicateStats = new Map<string, { count: number; values: number[] }>()
    
    for (const record of nonZeroRecords) {
      // Use province if available, otherwise use 'unknown'
      const province = record.province || 'unknown'
      const key = `${record.city}-${province}-${record.date}-${record.hour}`
      
      if (uniqueRecords.has(key)) {
        // Track duplicate statistics
        const stats = duplicateStats.get(key) || { count: 1, values: [uniqueRecords.get(key)!.insolation_percentage] }
        stats.count++
        stats.values.push(record.insolation_percentage)
        duplicateStats.set(key, stats)
        
        // Average the percentage values for duplicates
        const existing = uniqueRecords.get(key)!
        const avgPercentage = stats.values.reduce((a, b) => a + b, 0) / stats.values.length
        existing.insolation_percentage = parseFloat(avgPercentage.toFixed(2))
      } else {
        uniqueRecords.set(key, { ...record, province })
        duplicateStats.set(key, { count: 1, values: [record.insolation_percentage] })
      }
    }
    
    // Log statistics
    const duplicates = Array.from(duplicateStats.entries())
      .filter(([, stats]) => stats.count > 1)
    
    console.log(`=== Deduplication Statistics ===`)
    console.log(`Original records: ${records.length}`)
    console.log(`After filtering 0% values: ${nonZeroRecords.length}`)
    console.log(`After deduplication: ${uniqueRecords.size}`)
    console.log(`Duplicate combinations found: ${duplicates.length}`)
    
    if (duplicates.length > 0 && duplicates.length <= 10) {
      duplicates.forEach(([key, stats]) => {
        console.log(`  ${key}: ${stats.count} occurrences, values: ${stats.values.join(', ')}`)
      })
    }
    
    return Array.from(uniqueRecords.values())
  }

  /**
   * Process Gemini vision responses and store in database
   */
  async processGeminiResponses(responses: GeminiVisionResponse[]): Promise<{ 
    totalRecords: number, 
    successfulWrites: number, 
    errors: string[] 
  }> {
    const allRecords: InsolationDataInput[] = []
    const errors: string[] = []

    // Convert Gemini responses to database records
    for (const response of responses) {
      try {
        for (const city of response.cities) {
          // Use province from Gemini if available, otherwise get from our mapping
          const province = city.province || getProvinceForCity(city.name)
          if (province) {
            allRecords.push({
              city: city.name,
              province: province,
              date: response.date,
              hour: response.hour,
              insolation_percentage: city.insolation_percentage
            })
          } else {
            console.warn(`No province found for city: ${city.name}`)
          }
        }
      } catch (error) {
        const errorMessage = `Failed to process response for ${response.date} ${response.hour}:00: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMessage)
        errors.push(errorMessage)
      }
    }

    // Deduplicate and filter records
    const processedRecords = this.deduplicateAndFilterRecords(allRecords)
    
    let successfulWrites = 0

    if (processedRecords.length > 0) {
      try {
        // All records now have provinces, no need for fallback
        const records = processedRecords.map(data => ({
          city: data.city,
          province: data.province,
          date: data.date,
          hour: data.hour,
          insolation_percentage: data.insolation_percentage
        }))

        const { error, count } = await this.supabase
          .from('insolation_data')
          .upsert(records, {
            onConflict: 'city,province,date,hour',
            ignoreDuplicates: false
          })

        if (error) {
          throw new Error(`Database upsert failed: ${error.message}`)
        }

        successfulWrites = count || records.length
        console.log(`Successfully wrote ${successfulWrites} insolation data records to database`)
      } catch (error) {
        const errorMessage = `Failed to write data to database: ${error instanceof Error ? error.message : String(error)}`
        console.error(errorMessage)
        errors.push(errorMessage)
      }
    }

    return {
      totalRecords: processedRecords.length,
      successfulWrites,
      errors
    }
  }

  /**
   * Get existing insolation data for a specific date and hour
   */
  async getInsolationData(date: string, hour: number): Promise<InsolationDataInput[]> {
    const { data, error } = await this.supabase
      .from('insolation_data')
      .select('city, province, date, hour, insolation_percentage')
      .eq('date', date)
      .eq('hour', hour)
      .order('city')

    if (error) {
      console.error('Failed to fetch insolation data:', error)
      throw new Error(`Failed to fetch insolation data: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get latest insolation data
   */
  async getLatestInsolationData(limit: number = 100): Promise<InsolationDataInput[]> {
    const { data, error } = await this.supabase
      .from('insolation_data')
      .select('city, province, date, hour, insolation_percentage')
      .order('date', { ascending: false })
      .order('hour', { ascending: false })
      .order('city')
      .limit(limit)

    if (error) {
      console.error('Failed to fetch latest insolation data:', error)
      throw new Error(`Failed to fetch latest insolation data: ${error.message}`)
    }

    return data || []
  }

  /**
   * Check if data exists for a specific date and hour
   */
  async dataExistsForDateTime(date: string, hour: number): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('insolation_data')
      .select('id', { count: 'exact', head: true })
      .eq('date', date)
      .eq('hour', hour)

    if (error) {
      console.error('Failed to check existing data:', error)
      return false
    }

    return (count || 0) > 0
  }

  /**
   * Get statistics about stored insolation data
   */
  async getDataStatistics(): Promise<{
    totalRecords: number,
    uniqueDates: number,
    uniqueCities: number,
    latestDate: string | null
  }> {
    try {
      // Get total records
      const { count: totalRecords } = await this.supabase
        .from('insolation_data')
        .select('id', { count: 'exact', head: true })

      // Get unique dates
      const { data: dates } = await this.supabase
        .from('insolation_data')
        .select('date')
        .order('date', { ascending: false })

      // Get unique cities
      const { data: cities } = await this.supabase
        .from('insolation_data')
        .select('city')

      const uniqueDates = new Set(dates?.map(d => d.date) || []).size
      const uniqueCities = new Set(cities?.map(c => c.city) || []).size
      const latestDate = dates?.[0]?.date || null

      return {
        totalRecords: totalRecords || 0,
        uniqueDates,
        uniqueCities,
        latestDate
      }
    } catch (error) {
      console.error('Failed to get data statistics:', error)
      return {
        totalRecords: 0,
        uniqueDates: 0,
        uniqueCities: 0,
        latestDate: null
      }
    }
  }

  /**
   * Delete old insolation data (cleanup utility)
   */
  async deleteOldData(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    const cutoffDateString = cutoffDate.toISOString().split('T')[0]

    const { count, error } = await this.supabase
      .from('insolation_data')
      .delete()
      .lt('date', cutoffDateString)

    if (error) {
      console.error('Failed to delete old data:', error)
      throw new Error(`Failed to delete old data: ${error.message}`)
    }

    return count || 0
  }
}