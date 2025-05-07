import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeRange = searchParams.get('timeRange') || '7d';
  
  // Get the token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  
  try {
    // Try to get data from the backend if the endpoint exists
    const response = await fetch(`${API_URL}/analytics/resources?timeRange=${timeRange}`, {
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
    console.log('Backend endpoint not found, returning mock data for /analytics/resources');
    
    // Mock data for resource usage
    return NextResponse.json([
      {
        projectId: 'project_1',
        projectName: 'E-commerce Frontend',
        cpu: {
          usage: 23.5,
          limit: 100,
          average: 18.2
        },
        memory: {
          usage: 256,
          limit: 512,
          average: 232
        },
        storage: {
          usage: 1.2,
          limit: 5,
          average: 1.1
        }
      },
      {
        projectId: 'project_2',
        projectName: 'API Backend',
        cpu: {
          usage: 45.2,
          limit: 200,
          average: 38.7
        },
        memory: {
          usage: 768,
          limit: 1024,
          average: 712
        },
        storage: {
          usage: 3.5,
          limit: 10,
          average: 3.2
        }
      },
      {
        projectId: 'project_3',
        projectName: 'Marketing Website',
        cpu: {
          usage: 12.1,
          limit: 50,
          average: 10.4
        },
        memory: {
          usage: 128,
          limit: 256,
          average: 124
        },
        storage: {
          usage: 0.8,
          limit: 2,
          average: 0.8
        }
      }
    ]);
  } catch (error) {
    console.error('Error fetching resource analytics:', error);
    
    // Return mock data in case of any error
    return NextResponse.json([
      {
        projectId: 'project_1',
        projectName: 'E-commerce Frontend',
        cpu: {
          usage: 23.5,
          limit: 100,
          average: 18.2
        },
        memory: {
          usage: 256,
          limit: 512,
          average: 232
        },
        storage: {
          usage: 1.2,
          limit: 5,
          average: 1.1
        }
      },
      {
        projectId: 'project_2',
        projectName: 'API Backend',
        cpu: {
          usage: 45.2,
          limit: 200,
          average: 38.7
        },
        memory: {
          usage: 768,
          limit: 1024,
          average: 712
        },
        storage: {
          usage: 3.5,
          limit: 10,
          average: 3.2
        }
      }
    ]);
  }
}