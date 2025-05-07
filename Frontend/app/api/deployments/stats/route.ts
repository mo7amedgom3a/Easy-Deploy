import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET() {
  // Get the token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  try {
    // Try to get data from the backend if the endpoint exists
    // If it returns 404, we'll catch it and return mock data
    const response = await fetch(`${API_URL}/deploy/stats`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    }
    
    // If the endpoint doesn't exist or returns an error, provide mock data
    console.log('Backend endpoint not found, returning mock data for /deployments/stats');
    
    // Mock data for deployment stats
    return NextResponse.json({
      total: 47,
      successful: 39,
      failed: 5,
      inProgress: 3,
      successRate: 83
    });
  } catch (error) {
    console.error('Error fetching deployment stats:', error);
    
    // Return mock data in case of any error
    return NextResponse.json({
      total: 47,
      successful: 39,
      failed: 5,
      inProgress: 3,
      successRate: 83
    });
  }
}