import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/constants';

// This endpoint handles the GitHub OAuth callback
export async function GET(request: Request) {
  // Extract the code from the query parameters
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
  }

  try {
    // Forward the code to the backend to exchange it for a JWT token
    const response = await fetch(`${API_URL}/auth/github/callback?code=${code}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache this request
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub callback failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
      return NextResponse.json(
        { error: 'Failed to authenticate with GitHub' }, 
        { status: response.status }
      );
    }

    // Successfully got the token from the backend
    const data = await response.json();

    // Return the JWT token from the backend to the client
    // The client-side code will store it locally and handle the redirection
    return NextResponse.json({ jwt_token: data.jwt_token });
  } catch (error) {
    console.error('GitHub callback error:', error);
    return NextResponse.json(
      { error: 'Failed to process GitHub authentication' }, 
      { status: 500 }
    );
  }
}