import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';
import { analyticsService } from '@/lib/services/analytics';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    try {
      // Try to fetch from the backend API first
      const response = await fetch(`${API_URL}/analytics/resources?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      
      // If backend API fails, generate fallback data from GitHub
      const resources = await analyticsService.generateResourceUsageFromGitHub();
      return NextResponse.json(resources);
      
    } catch (error) {
      console.error('Error fetching analytics resources:', error);
      
      // Generate fallback data from GitHub
      const resources = await analyticsService.generateResourceUsageFromGitHub();
      return NextResponse.json(resources);
    }
  } catch (error) {
    console.error('Error in analytics resources API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics resources' },
      { status: 500 }
    );
  }
}