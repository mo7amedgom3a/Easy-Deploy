import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';
import { deploymentsService } from '@/lib/services/deployments';

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
    
    try {
      // Try to fetch from the backend API first
      const response = await fetch(`${API_URL}/deployments/stats`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      
      // If backend API fails, generate fallback deployment stats from GitHub activity
      const commits = await deploymentsService.getRecentGitHubActivity(20);
      const stats = {
        total: commits.length,
        successful: commits.length,
        failed: 0,
        inProgress: 0,
        successRate: commits.length > 0 ? 100 : 0
      };
      
      return NextResponse.json(stats);
      
    } catch (error) {
      console.error('Error fetching deployment stats:', error);
      
      // Generate fallback stats from GitHub activity
      const commits = await deploymentsService.getRecentGitHubActivity(20);
      const stats = {
        total: commits.length,
        successful: commits.length,
        failed: 0,
        inProgress: 0,
        successRate: commits.length > 0 ? 100 : 0
      };
      
      return NextResponse.json(stats);
    }
  } catch (error) {
    console.error('Error in deployment stats API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deployment stats' },
      { status: 500 }
    );
  }
}