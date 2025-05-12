import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This endpoint is ONLY for development purposes
export async function GET(request: Request) {
  // Only allow this in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get('redirectTo') || '/dashboard';

  // Create a mock JWT token for development
  const mockToken = 'mock_dev_token_' + Math.random().toString(36).substring(2, 15);

  // Set the mock token in a cookie
  const cookieStore = await cookies();
  cookieStore.set('authToken', mockToken, {
    httpOnly: true,
    secure: false, // Don't require HTTPS in development
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  // Redirect to the dashboard or specified redirect path
  return NextResponse.redirect(new URL(redirectTo, request.url));
} 