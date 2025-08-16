import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Env } from './lib/Env.mjs'

function getSupabaseUrl() {
  const url = Env.SUPABASE_URL
  if (!url) {
    throw new Error('Missing Env.SUPABASE_URL')
  }
  return url
}

function getSupabaseAnonKey() {
  const key = Env.SUPABASE_ANON_KEY
  if (!key) {
    throw new Error('Missing Env.SUPABASE_ANON_KEY')
  }
  return key
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      }
    }
  )

  // This will refresh session if expired - required for Server Components
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Middleware: błąd pobierania użytkownika:', error)
  }

  // Define public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/api/cron']
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Define protected routes that require authentication
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          (request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/api/cron')) ||
                          request.nextUrl.pathname === '/'

  // If user is not authenticated and trying to access protected route
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access auth pages
  if (user && isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // If user is authenticated and on root, redirect to dashboard
  if (user && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
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

