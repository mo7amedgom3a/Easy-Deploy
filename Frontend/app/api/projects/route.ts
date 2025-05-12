import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';
import { githubService } from '@/lib/services/github';

/**
 * Convert a GitHub repository to a project format
 */
function convertRepoToProject(repo: any) {
  // Generate tags based on repository properties
  const tags: string[] = [];
  if (repo.language) tags.push(repo.language);
  if (repo.visibility) tags.push(repo.visibility);
  
  return {
    id: `github_${repo.id}`,
    name: repo.name,
    description: repo.description || `Repository: ${repo.name}`,
    tags,
    status: "not_deployed",
    lastDeployed: repo.updated_at || undefined,
    repository: repo.full_name,
    repositoryUrl: repo.html_url,
    environment: 'development'
  };
}

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
    
    const response = await fetch(`${API_URL}/deploy/projects`, {
      headers: {
        'Authorization': `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}