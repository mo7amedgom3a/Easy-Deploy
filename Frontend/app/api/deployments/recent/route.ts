import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';
import { deploymentsService } from '@/lib/services/deployments';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    
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
      const response = await fetch(`${API_URL}/deployments/recent?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      
      // If backend API fails, use GitHub activity as fallback "deployments"
      const recentActivity = await deploymentsService.getRecentGitHubActivity(limit);
      return NextResponse.json(recentActivity);
      
    } catch (error) {
      console.error('Error fetching recent deployments:', error);
      
      // Use GitHub activity as fallback "deployments"
      const recentActivity = await deploymentsService.getRecentGitHubActivity(limit);
      return NextResponse.json(recentActivity);
    }
  } catch (error) {
    console.error('Error in recent deployments API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent deployments' },
      { status: 500 }
    );
  }
}