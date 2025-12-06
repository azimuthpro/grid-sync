import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from './lib/supabase/client'

// Pre-compiled route patterns for O(1) lookup performance
const PUBLIC_ROUTES = new Set(['/login', '/register', '/api/cron'])
const API_PREFIX = '/api'
const DASHBOARD_PREFIX = '/dashboard'
const ROOT_PATH = '/'

// Helper functions for route classification
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.has(pathname) || 
         PUBLIC_ROUTES.has(pathname.split('/').slice(0, 3).join('/'))
}

function isProtectedRoute(pathname: string): boolean {
  return pathname.startsWith(DASHBOARD_PREFIX) ||
         (pathname.startsWith(API_PREFIX) && !pathname.startsWith('/api/cron')) ||
         pathname === ROOT_PATH
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const isPublic = isPublicRoute(pathname)
  const isProtected = isProtectedRoute(pathname)

  // Early return for routes that don't need authentication handling
  if (!isPublic && !isProtected) {
    return NextResponse.next()
  }

  // Create response object for cookie handling
  const response = NextResponse.next({ request })

  // Create Supabase client with optimized cookie handling
  const supabase = createSupabaseServerClient({
    getAll: () => request.cookies.getAll(),
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      request.cookies.set(name, value)
      response.cookies.set(name, value, options)
    }
  })

  // Get user authentication status
  let user = null
  try {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    
    if (error && error.message !== 'Auth session missing!' && isProtected) {
      console.error('Proxy: Authentication error:', error)
    }
    
    user = authUser
  } catch (error) {
    if (isProtected) {
      console.error('Proxy: Authentication error:', error)
    }
  }

  // Handle authentication redirects
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (isPublic || pathname === ROOT_PATH)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

