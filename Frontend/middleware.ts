import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedRoute } from '@/lib/auth-utils';

export function middleware(request: NextRequest) {
  // Get token from cookies
  const authToken = request.cookies.get('authToken');
  const { pathname } = request.nextUrl;
  
  // Check if it's a protected route
  if (isProtectedRoute(pathname)) {
    // If no token is present, redirect to login
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If there is a token and trying to access login, redirect to dashboard
  if (authToken && (pathname === '/login' || pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Configure the paths for the middleware to run on
export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};