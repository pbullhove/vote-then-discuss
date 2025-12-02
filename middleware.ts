import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/auth', '/session']

// Check if a route is public (doesn't require authentication)
const isPublicRoute = (pathname: string): boolean => {
  return publicRoutes.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  // Update the session to refresh auth cookies and get the user
  const { response, user } = await updateSession(request)

  // Check if the route is protected
  if (!isPublicRoute(request.nextUrl.pathname)) {
    // For protected routes, check if user is authenticated
    if (!user) {
      // Redirect to login if not authenticated
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
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

