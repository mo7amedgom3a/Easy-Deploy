import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/constants';
import { cookies } from 'next/headers';

// This endpoint handles the GitHub OAuth callback
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    // Call backend to exchange code for token
    const response = await fetch(`${API_URL}/auth/github/callback?code=${code}${state ? `&state=${state}` : ''}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with GitHub');
    }

    const data = await response.json();
    
    // Create response with redirect
    const redirectResponse = NextResponse.redirect(
      new URL(data.state || '/dashboard', request.url)
    );

    // Set the token in an HTTP-only cookie
    redirectResponse.cookies.set({
      name: 'authorization',
      value: `Bearer ${data.token}`,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    return redirectResponse;
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }
}