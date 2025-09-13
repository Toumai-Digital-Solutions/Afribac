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
