import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow access to onboarding page without checks
  if (request.nextUrl.pathname === '/onboarding') {
    return response
  }

  // Protect dashboard and settings routes
  if ((request.nextUrl.pathname.startsWith('/dashboard') || 
       request.nextUrl.pathname.startsWith('/settings')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Check if user needs onboarding (for dashboard and settings pages)
  if (user && (request.nextUrl.pathname.startsWith('/dashboard') || 
               request.nextUrl.pathname.startsWith('/settings'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('study_program, degree_type')
      .eq('id', user.id)
      .single()
    
    // Check if user has completed basic profile setup
    if (!profile?.study_program || !profile?.degree_type) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    
    // Check if user has any courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
    
    if (!courses || courses.length === 0) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // Redirect authenticated users away from auth pages (except update-password)
  if (
    user &&
    request.nextUrl.pathname !== '/update-password' &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register' ||
      request.nextUrl.pathname === '/reset-password')
  ) {
    // Check if user needs onboarding first
    const { data: profile } = await supabase
      .from('profiles')
      .select('study_program, degree_type')
      .eq('id', user.id)
      .single()
    
    if (!profile?.study_program || !profile?.degree_type) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
    
    if (!courses || courses.length === 0) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
    
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