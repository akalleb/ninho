import { NextResponse } from 'next/server';

/**
 * Middleware - Pass-through for client-side authentication
 * Route protection is now handled client-side via ProtectedRoute component
 * No JWT/session validation needed
 */
export function middleware(req) {
  // Allow all requests - authentication is handled client-side
  // The ProtectedRoute component will redirect unauthenticated users
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

