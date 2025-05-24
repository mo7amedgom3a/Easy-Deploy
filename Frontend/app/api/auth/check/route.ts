import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/constants';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookie
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('authorization');
    
    if (!authCookie) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null
      });
    }

    // Call backend to check authentication status
    const response = await fetch(`${API_URL}/auth/check`, {
      method: 'GET',
      headers: {
        'Authorization': authCookie.value
      },
      credentials: 'include',
    });

    if (!response.ok) {
      // If the token is invalid, clear the cookie
      const errorResponse = NextResponse.json({ 
        isAuthenticated: false,
        user: null
      });
      errorResponse.cookies.delete('authorization');
      return errorResponse;
    }

    const data = await response.json();
    return NextResponse.json({
      isAuthenticated: true,
      user: data.user
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null
    });
  }
}
