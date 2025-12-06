import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CronJobResult } from '@/types'
import { ImageProcessor } from '@/lib/services/image-processor'
import { GeminiVisionService } from '@/lib/services/gemini-vision'
import { InsolationDataService } from '@/lib/services/insolation-data'
import { Env } from '@/lib/Env.mjs'

export const maxDuration = 300

function getSupabaseUrl() {
  const url = Env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_URL')
  }
  return url
}

function getSupabaseAnonKey() {
  const key = Env.SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing Env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return key
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function POST() {
  const startTime = Date.now()

  try {
    // Verify user is authenticated
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Unauthorized',
          message: 'You must be logged in to fetch insolation data',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('='.repeat(50))
    console.log('MANUAL INSOLATION FETCH STARTED')
    console.log('='.repeat(50))
    console.log('User ID:', user.id)
    console.log('User Email:', user.email)
    console.log('Timestamp:', new Date().toISOString())
    console.log('-'.repeat(50))

    // Initialize result tracking
    const result: CronJobResult = {
      success: false,
      processed_images: 0,
      failed_images: 0,
      database_writes: 0,
      errors: [],
      execution_time_ms: 0,
      timestamp: new Date().toISOString(),
    }

    console.log('Starting insolation data fetch process...')

    // Step 1: Generate image URLs
    const imageUrls = ImageProcessor.generateImageUrls()
    console.log(`Generated ${imageUrls.length} image URLs for processing`)

    // Step 2: Process images with Gemini Vision API
    console.log('Starting Gemini vision analysis...')
    const geminiResponses = await GeminiVisionService.analyzeImages(imageUrls)

    result.processed_images = geminiResponses.length
    result.failed_images = imageUrls.length - geminiResponses.length

    if (geminiResponses.length === 0) {
      throw new Error('No images were successfully analyzed by Gemini')
    }

    console.log(
      `Successfully analyzed ${geminiResponses.length}/${imageUrls.length} images`
    )

    // Step 3: Store data in database
    console.log('Storing data in database...')
    const dbService = new InsolationDataService()
    const dbResult = await dbService.processGeminiResponses(geminiResponses)

    result.database_writes = dbResult.successfulWrites
    result.errors.push(...dbResult.errors)

    console.log(
      `Successfully wrote ${dbResult.successfulWrites} records to database`
    )

    // Calculate execution time
    result.execution_time_ms = Date.now() - startTime
    result.success = result.errors.length === 0 || result.database_writes > 0

    console.log('-'.repeat(50))
    console.log('MANUAL FETCH COMPLETED')
    console.log('Success:', result.success)
    console.log('Execution Time:', `${result.execution_time_ms}ms`)
    console.log('Processed Images:', result.processed_images)
    console.log('Database Writes:', result.database_writes)
    console.log('='.repeat(50))

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Insolation data fetch completed',
        result,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)

    console.error('Manual fetch failed:', errorMessage)
    console.log('-'.repeat(50))
    console.log('MANUAL FETCH FAILED')
    console.log('Error:', errorMessage)
    console.log('Execution Time:', `${executionTime}ms`)
    console.log('='.repeat(50))

    // Return error response
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Fetch failed',
        message: errorMessage,
        execution_time_ms: executionTime,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
