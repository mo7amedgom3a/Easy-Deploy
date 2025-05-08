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
    
    try {
      // Try to fetch from the backend API first
      const response = await fetch(`${API_URL}/projects/`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      
      // If backend API fails, generate fallback projects from GitHub repositories
      const githubUser = await githubService.getCurrentUser();
      if (githubUser && githubUser.login) {
        const repos = await githubService.getRepositories(githubUser.login);
        
        // Convert GitHub repositories to project format
        const projects = repos.map(repo => convertRepoToProject(repo));
        return NextResponse.json(projects);
      }
      
      return NextResponse.json([]);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // Generate fallback projects from GitHub repositories
      const githubUser = await githubService.getCurrentUser();
      if (githubUser && githubUser.login) {
        const repos = await githubService.getRepositories(githubUser.login);
        
        // Convert GitHub repositories to project format
        const projects = repos.map(repo => convertRepoToProject(repo));
        return NextResponse.json(projects);
      }
      
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error in projects API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}