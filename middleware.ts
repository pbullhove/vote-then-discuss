import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Define public routes that don't require authentication
const publicRoutePrefixes = ['/login', '/auth', '/session']

// Check if a route is public (doesn't require authentication)
const isPublicRoute = (pathname: string): boolean => {
  if (pathname === '/') return true
  return publicRoutePrefixes.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // 1) Host-based routing
  // Support both production and localhost for admin host
  const isAdminHost =
    host.startsWith('admin.votethendiscuss.com') ||
    host.startsWith('localhost:') && host.includes('admin.');

  // If admin.* and not already under /admin, internally rewrite to /admin + path
  if (isAdminHost && !url.pathname.startsWith('/admin')) {
    url.pathname = '/admin' + url.pathname;
  }

  // 2) Update session (auth cookies + user)
  const { response, user } = await updateSession(request);

  // Use the *effective* path (after host-based adjustment) for route protection
  const effectivePathname = url.pathname;

  // 3) Auth guard
  if (!isPublicRoute(effectivePathname)) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirectedFrom', effectivePathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4) Apply rewrite for admin host (internal – no visible redirect)
  if (isAdminHost) {
    return NextResponse.rewrite(url);
  }

  // Non-admin host → normal response
  return response;
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

