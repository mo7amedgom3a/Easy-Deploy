import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('authToken');
    
    if (!authToken) {
      // For development - return mock analytics data
      if (process.env.NODE_ENV === 'development') {
        const today = new Date();
        const daily_deployments = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          daily_deployments[dateString] = Math.floor(Math.random() * 5) + 1;
        }
        
        return NextResponse.json({
          daily_deployments,
          total_deployments: 24,
          successful_deployments: 20,
          failed_deployments: 4,
          success_rate: 83.33,
          time_range: '7d'
        });
      } else {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
    }
    
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    try {
      const response = await fetch(`${API_URL}/deploy/analytics/resources?timeRange=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // For development - return mock data on auth failure
        if (process.env.NODE_ENV === 'development') {
          console.log(`Using mock analytics data due to auth error: ${response.statusText}`);
          
          const today = new Date();
          const daily_deployments = {};
          for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            daily_deployments[dateString] = Math.floor(Math.random() * 5) + 1;
          }
          
          return NextResponse.json({
            daily_deployments,
            total_deployments: 24,
            successful_deployments: 20,
            failed_deployments: 4,
            success_rate: 83.33,
            time_range: timeRange
          });
        } else {
          throw new Error(`Failed to fetch resource analytics: ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error fetching resource analytics from API:', error);
      
      // For development - return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock analytics data');
        
        const today = new Date();
        const daily_deployments = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          daily_deployments[dateString] = Math.floor(Math.random() * 5) + 1;
        }
        
        return NextResponse.json({
          daily_deployments,
          total_deployments: 24,
          successful_deployments: 20,
          failed_deployments: 4,
          success_rate: 83.33,
          time_range: timeRange
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error fetching resource analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resource analytics' },
      { status: 500 }
    );
  }
}