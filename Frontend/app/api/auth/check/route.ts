import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    
    if (!token) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Verify token with backend
    try {
      const response = await fetch(`${API_URL}/users/github/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      if (response.ok) {
        return NextResponse.json({ isAuthenticated: true });
      } else {
        return NextResponse.json({ isAuthenticated: false });
      }
    } catch (error) {
      console.error('Backend validation error:', error);
      return NextResponse.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
