import { NextRequest } from 'next/server'
import type { CronJobResult } from '@/types'
import { ImageProcessor } from '@/lib/services/image-processor'
import { GeminiVisionService } from '@/lib/services/gemini-vision'
import { InsolationDataService } from '@/lib/services/insolation-data'
import { CronAuthUtils } from '@/lib/utils/cron-auth'

export const config = {
  maxDuration: 300,
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const metadata = CronAuthUtils.getRequestMetadata(request)
  
  // Log execution start
  CronAuthUtils.logExecutionStart(metadata)

  // Verify authorization (skip in test mode for development)
  if (!metadata.isTest && !CronAuthUtils.verifyCronRequest(request)) {
    return CronAuthUtils.createUnauthorizedResponse()
  }

  try {
    // Initialize result tracking
    const result: CronJobResult = {
      success: false,
      processed_images: 0,
      failed_images: 0,
      database_writes: 0,
      errors: [],
      execution_time_ms: 0,
      timestamp: metadata.timestamp
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

    console.log(`Successfully analyzed ${geminiResponses.length}/${imageUrls.length} images`)

    // Step 3: Store data in database (skip if dry run)
    if (!metadata.isDryRun) {
      console.log('Storing data in database...')
      const dbService = new InsolationDataService()
      const dbResult = await dbService.processGeminiResponses(geminiResponses)
      
      result.database_writes = dbResult.successfulWrites
      result.errors.push(...dbResult.errors)

      console.log(`Successfully wrote ${dbResult.successfulWrites} records to database`)
    } else {
      console.log('Dry run mode: Skipping database writes')
      // In dry run, count what would have been written
      const totalRecords = geminiResponses.reduce(
        (sum, response) => sum + response.cities.length, 
        0
      )
      result.database_writes = totalRecords
    }

    // Calculate execution time
    result.execution_time_ms = Date.now() - startTime
    result.success = result.errors.length === 0 || result.database_writes > 0

    // Log execution end
    CronAuthUtils.logExecutionEnd(startTime, result.success, {
      processed_images: result.processed_images,
      failed_images: result.failed_images,
      database_writes: result.database_writes,
      errors_count: result.errors.length
    })

    // Return success response
    return CronAuthUtils.createSuccessResponse({
      message: 'Insolation data fetch completed',
      result,
      mode: {
        test: metadata.isTest,
        dry_run: metadata.isDryRun
      }
    })

  } catch (error) {
    const executionTime = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    console.error('Cron job failed:', errorMessage)
    
    // Log execution end with error
    CronAuthUtils.logExecutionEnd(startTime, false, {
      error: errorMessage
    })

    // Return error response
    return CronAuthUtils.createErrorResponse(
      'Cron job execution failed',
      {
        error: errorMessage,
        execution_time_ms: executionTime,
        timestamp: metadata.timestamp,
        mode: {
          test: metadata.isTest,
          dry_run: metadata.isDryRun
        }
      }
    )
  }
}

// POST method for manual testing
export async function POST(request: NextRequest) {
  // Force test mode for POST requests
  const url = new URL(request.url)
  url.searchParams.set('test', 'true')
  
  const testRequest = new NextRequest(url, {
    method: 'GET',
    headers: request.headers
  })
  
  return GET(testRequest)
}

// OPTIONS method for CORS (if needed)
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}