import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/constants';

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
    
    // Try to fetch projects from the backend API
    try {
      const response = await fetch(`${API_URL}/deploy/projects`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Successfully fetched projects from backend:', data);
        return NextResponse.json(data);
      } else {
        console.log(`Backend projects API returned ${response.status}, falling back to GitHub repositories`);
      }
    } catch (backendError) {
      console.error('Backend projects API error:', backendError);
      console.log('Falling back to GitHub repositories');
    }
    
    // Fallback: Fetch GitHub repositories if backend projects API fails
    try {
      // First get the current user
      const userResponse = await fetch(`${API_URL}/users/github/me/`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user: ${userResponse.statusText}`);
      }
      
      const userData = await userResponse.json();
      const username = userData.login;
      
      if (!username) {
        throw new Error('No username found in user data');
      }
      
      // Fetch repositories for this user
      const reposResponse = await fetch(`${API_URL}/git/repository/${username}`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!reposResponse.ok) {
        throw new Error(`Failed to fetch repositories: ${reposResponse.statusText}`);
      }
      
      const repos = await reposResponse.json();
      
      if (Array.isArray(repos)) {
        const projects = repos.map(repo => convertRepoToProject(repo));
        console.log(`Returning ${projects.length} GitHub repositories as projects`);
        return NextResponse.json(projects);
      } else {
        console.log('Invalid repositories response format');
        return NextResponse.json([]);
      }
    } catch (githubError) {
      console.error('Error fetching GitHub repositories:', githubError);
      return NextResponse.json(
        { error: 'Failed to fetch projects and repositories' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in projects API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}