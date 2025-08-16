import { NextRequest } from 'next/server'
import { Env } from '../Env.mjs'

export class CronAuthUtils {
  /**
   * Verify that the request is from Vercel Cron
   * Checks for the authorization header that Vercel sends with cron requests
   */
  static verifyCronRequest(request: NextRequest): boolean {
    // Check for Vercel cron authorization header
    const authHeader = request.headers.get('authorization')
    const cronSecret = Env.CRON_SECRET

    // In production, verify the authorization header
    if (Env.NODE_ENV === 'production') {
      if (!authHeader) {
        console.error('Missing authorization header in cron request')
        return false
      }

      if (!cronSecret) {
        console.error('CRON_SECRET environment variable not configured')
        return false
      }

      // Vercel sends "Bearer <token>" in the authorization header
      const expectedAuth = `Bearer ${cronSecret}`
      if (authHeader !== expectedAuth) {
        console.error('Invalid authorization header in cron request')
        return false
      }
    }

    // Additional verification: Check for Vercel-specific headers
    const vercelHeaders = {
      'user-agent': request.headers.get('user-agent'),
      'x-vercel-cron': request.headers.get('x-vercel-cron'),
      'x-vercel-signature': request.headers.get('x-vercel-signature')
    }

    // Log headers for debugging (in development only)
    if (Env.NODE_ENV === 'development') {
      console.log('Cron request headers:', vercelHeaders)
    }

    return true
  }

  /**
   * Check if the request is a test request (for manual testing)
   */
  static isTestRequest(request: NextRequest): boolean {
    const testParam = request.nextUrl.searchParams.get('test')
    return testParam === 'true'
  }

  /**
   * Check if the request is a dry run (no database writes)
   */
  static isDryRun(request: NextRequest): boolean {
    const dryRunParam = request.nextUrl.searchParams.get('dry_run')
    return dryRunParam === 'true'
  }

  /**
   * Get request metadata for logging
   */
  static getRequestMetadata(request: NextRequest): {
    userAgent: string | null
    ip: string | null
    timestamp: string
    isTest: boolean
    isDryRun: boolean
  } {
    return {
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      timestamp: new Date().toISOString(),
      isTest: this.isTestRequest(request),
      isDryRun: this.isDryRun(request)
    }
  }

  /**
   * Create error response for unauthorized requests
   */
  static createUnauthorizedResponse(): Response {
    return new Response(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'This endpoint can only be called by Vercel Cron'
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  /**
   * Create success response for cron execution
   */
  static createSuccessResponse(data: object): Response {
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        ...data
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  /**
   * Create error response for cron execution
   */
  static createErrorResponse(error: string, details?: object): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error,
        timestamp: new Date().toISOString(),
        ...details
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  /**
   * Log cron execution start
   */
  static logExecutionStart(metadata: ReturnType<typeof CronAuthUtils.getRequestMetadata>): void {
    console.log('='.repeat(50))
    console.log('CRON EXECUTION STARTED')
    console.log('='.repeat(50))
    console.log('Timestamp:', metadata.timestamp)
    console.log('User Agent:', metadata.userAgent)
    console.log('IP Address:', metadata.ip)
    console.log('Test Mode:', metadata.isTest)
    console.log('Dry Run:', metadata.isDryRun)
    console.log('Environment:', Env.NODE_ENV)
    console.log('-'.repeat(50))
  }

  /**
   * Log cron execution end
   */
  static logExecutionEnd(
    startTime: number, 
    success: boolean, 
    details?: object
  ): void {
    const executionTime = Date.now() - startTime
    console.log('-'.repeat(50))
    console.log('CRON EXECUTION COMPLETED')
    console.log('Success:', success)
    console.log('Execution Time:', `${executionTime}ms`)
    if (details) {
      console.log('Details:', JSON.stringify(details, null, 2))
    }
    console.log('='.repeat(50))
  }
}