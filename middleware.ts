import { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  
  const pathname = request.nextUrl.pathname
  const code = request.nextUrl.searchParams.get('code')

  // If Supabase sends a root URL with ?code=..., forward to our callback with onboarding as next
  if (code && pathname !== '/auth/callback') {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/callback'
    url.searchParams.set('code', code)
    if (!url.searchParams.get('next')) url.searchParams.set('next', '/auth/onboarding')
    return Response.redirect(url)
  }

  // If user is authenticated and on auth pages (except callback), redirect to dashboard
  if (user && pathname.startsWith('/auth') && pathname !== '/auth/callback' && !pathname.startsWith('/auth/onboarding')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return Response.redirect(url)
  }

  // If user is authenticated and on root, redirect to dashboard  
//   if (user && pathname === '/') {
//     const url = request.nextUrl.clone()
//     url.pathname = '/dashboard'
//     return Response.redirect(url)
//   }

  // If user is not authenticated and trying to access protected routes
  const protectedRoutes = ['/dashboard', '/admin', '/member', '/student']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/signin'
    return Response.redirect(url)
  }

  // If user is authenticated but account is suspended/deleted, block protected routes
  if (user && isProtectedRoute && !pathname.startsWith('/auth')) {
    try {
      // Dynamically import to avoid edge bundling issues if any
      const { createServerClient } = await import('@supabase/ssr')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (supabaseUrl && supabaseKey) {
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            },
          }
        })

        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .maybeSingle()

        const status = (profile as any)?.status as string | undefined
        if (status === 'suspended' || status === 'deleted') {
          const url = request.nextUrl.clone()
          url.pathname = '/auth/account-disabled'
          url.searchParams.set('status', status)
          return Response.redirect(url)
        }
      }
    } catch {
      // fail-open: don't block if middleware lookup fails
    }
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
