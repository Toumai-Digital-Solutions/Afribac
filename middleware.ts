import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Simple approach: Let client-side handle auth state management
  // Only redirect from auth pages if there's a session indication
  
  // Check for auth token in cookies (Supabase default cookie names)
  const hasSession = req.cookies.has('sb-access-token') || 
                    req.cookies.has('supabase.auth.token') ||
                    req.cookies.has('sb-refresh-token')

  // If user appears to be logged in and is on auth pages, redirect to dashboard
  if (hasSession && pathname.startsWith('/auth') && pathname !== '/auth/callback') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user appears to be logged in and is on root, redirect to dashboard  
  if (hasSession && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
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
