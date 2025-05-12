import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      return NextResponse.json(
        { authenticated: false, error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Validate the token with the backend
    try {
      const response = await fetch(`${API_URL}/users/github/me/`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return NextResponse.json(
          { authenticated: false, error: `Token validation failed: ${response.statusText}` },
          { status: 401 }
        );
      }
      
      return NextResponse.json({ authenticated: true });
    } catch (error) {
      console.error('Error validating authentication token:', error);
      return NextResponse.json(
        { authenticated: false, error: 'Failed to validate authentication token' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
