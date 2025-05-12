import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

// This endpoint handles the GitHub OAuth callback
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state') || '/dashboard';
    
    if (!code) {
      console.error('No GitHub authorization code provided');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // Exchange the code for a JWT token from the backend
    console.log('Exchanging code for token with backend...');
    const response = await fetch(`${API_URL}/auth/github/callback?code=${code}&state=${encodeURIComponent(state)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub callback failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      return NextResponse.redirect(new URL(`/login?error=auth_failed`, request.url));
    }

    // Successfully got the token from the backend
    const data = await response.json();
    
    if (!data.jwt_token) {
      console.error('No JWT token returned from backend');
      return NextResponse.redirect(new URL('/login?error=no_token', request.url));
    }

    console.log('Successfully received JWT token from backend, setting cookie');
    
    // Set the JWT token in an HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('authToken', data.jwt_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Get redirectTo from backend response, falling back to the state parameter or dashboard
    const redirectTo = data.state || state || '/dashboard';
    console.log(`Redirecting to: ${redirectTo}`);
    
    // Redirect to the dashboard or specified redirect path
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(new URL('/login?error=unknown', request.url));
  }
}