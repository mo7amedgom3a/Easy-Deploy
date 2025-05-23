import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Fetch the GitHub user from backend API
    const response = await fetch(`${API_URL}/users/github/me/`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch user: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const userData = await response.json();
    
    // Return user data in a format compatible with the projects service
    return NextResponse.json({
      id: userData.id,
      username: userData.login,
      login: userData.login,
      name: userData.name || userData.login,
      email: userData.email,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
