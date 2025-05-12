import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const error = url.searchParams.get('error');
    const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

    if (error) {
      console.error('Login error:', error);
      // Redirect to login page with error message
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!token) {
      console.error('No token provided in callback');
      return NextResponse.redirect(new URL('/login?error=no_token', request.url));
    }

    // Set the token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Redirect to the dashboard or specified redirect path
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('Login callback error:', error);
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }
} 