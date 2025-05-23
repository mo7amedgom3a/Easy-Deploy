import { apiClient } from "../api-client";
import { githubService, GitHubRepository } from "./github";

export interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "success" | "failed" | "building" | "not_deployed";
  lastDeployed?: string;
  repository?: string;
  repositoryUrl?: string;
  domain?: string;
  framework?: string;
  nodeVersion?: string;
  environment?: string;
  buildCommand?: string;
  outputDirectory?: string;
  rootDirectory?: string;
  installCommand?: string;
  autoScaling?: boolean;
  autoHealing?: boolean;
}

// Add an interface for error responses
export interface ApiErrorResponse {
  error: string;
  status?: string | number;
  message?: string;
  detail?: string;
}

export const projectsService = {
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[] | ApiErrorResponse> {
    try {
      // Use the frontend API route instead of calling backend directly
      const response = await fetch('/api/projects', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
      });
      
      // Check if response is ok
      if (!response.ok) {
        console.error('API request failed:', response.status, response.statusText);
        
        // If API fails, try to get GitHub repositories as fallback
        try {
          // First get the current user to get their username
          const userResponse = await fetch('/api/auth/user', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            cache: 'no-store'
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const username = userData.username || userData.login;
            
            if (username) {
              const githubResponse = await fetch(`/api/repository/github?username=${encodeURIComponent(username)}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',
                cache: 'no-store'
              });
              
              if (githubResponse.ok) {
                const githubData = await githubResponse.json();
                if (Array.isArray(githubData)) {
                  return githubData.map(repo => convertRepoToProject(repo));
                }
              }
            }
          }
        } catch (githubError) {
          console.error('Error fetching GitHub repositories:', githubError);
        }
        
        return {
          error: `Failed to fetch projects: ${response.status} ${response.statusText}`,
          status: 'error'
        };
      }
      
      const data = await response.json();
      
      // Check if response contains an error
      if (data && typeof data === 'object' && 'error' in data) {
        console.error('API returned an error:', data.error);
        return data as ApiErrorResponse;
      }
      
      // Check if response is an array (projects data)
      if (Array.isArray(data)) {
        return data;
      } else if (data.projects && Array.isArray(data.projects)) {
        return data.projects;
      }
      
      // If no projects found, try GitHub repositories as fallback
      try {
        // First get the current user to get their username
        const userResponse = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const username = userData.username || userData.login;
          
          if (username) {
            const githubResponse = await fetch(`/api/repository/github?username=${encodeURIComponent(username)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              cache: 'no-store'
            });
            
            if (githubResponse.ok) {
              const githubData = await githubResponse.json();
              if (Array.isArray(githubData)) {
                return githubData.map(repo => convertRepoToProject(repo));
              }
            }
          }
        }
      } catch (githubError) {
        console.error('Error fetching GitHub repositories:', githubError);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // Properly type the error response
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Try to get GitHub repositories as fallback
      try {
        // First get the current user to get their username
        const userResponse = await fetch('/api/auth/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const username = userData.username || userData.login;
          
          if (username) {
            const githubResponse = await fetch(`/api/repository/github?username=${encodeURIComponent(username)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              cache: 'no-store'
            });
            
            if (githubResponse.ok) {
              const githubData = await githubResponse.json();
              if (Array.isArray(githubData)) {
                return githubData.map(repo => convertRepoToProject(repo));
              }
            }
          }
        }
      } catch (githubError) {
        console.error('Error fetching GitHub repositories:', githubError);
      }
      
      // Return a properly formatted error object
      return { 
        error: errorMessage,
        status: 'error'
      };
    }
  },

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<Project | ApiErrorResponse | null> {
    try {
      // Check if it's a GitHub repository ID
      if (id.startsWith('github_')) {
        const githubId = id.replace('github_', '');
        const githubUser = await githubService.getCurrentUser();
        
        if (githubUser && githubUser.login) {
          // Get all repositories and find the matching one
          const repos = await githubService.getRepositories(githubUser.login);
          const repo = repos.find(r => r.id.toString() === githubId);
          
          if (repo) {
            return convertRepoToProject(repo);
          }
        }
        return null;
      }
      
      // Regular project ID
      const response = await apiClient.get(`/projects/${id}`);
      
      // Check if response is an error object
      if (response && typeof response === 'object' && 'error' in response) {
        return response as ApiErrorResponse;
      }
      
      return response as Project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { error: errorMessage, status: 'error' };
    }
  },

  /**
   * Create a new project
   */
  async createProject(project: Partial<Project>): Promise<Project | ApiErrorResponse> {
    try {
      const response = await apiClient.post('/projects/', project);
      
      // Check if response is an error object
      if (response && typeof response === 'object' && 'error' in response) {
        return response as ApiErrorResponse;
      }
      
      return response as Project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { error: errorMessage, status: 'error' };
    }
  },

  /**
   * Update a project
   */
  async updateProject(id: string, project: Partial<Project>): Promise<Project | ApiErrorResponse> {
    try {
      const response = await apiClient.put(`/projects/${id}`, project);
      
      // Check if response is an error object
      if (response && typeof response === 'object' && 'error' in response) {
        return response as ApiErrorResponse;
      }
      
      return response as Project;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { error: errorMessage, status: 'error' };
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void | ApiErrorResponse> {
    try {
      const response = await apiClient.delete(`/projects/${id}`);
      
      // Check if response is an error object
      if (response && typeof response === 'object' && 'error' in response) {
        return response as ApiErrorResponse;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return { error: errorMessage, status: 'error' };
    }
  }
};

/**
 * Convert a GitHub repository to a project format
 */
function convertRepoToProject(repo: GitHubRepository): Project {
  // Generate tags based on repository properties
  const tags: string[] = [];
  if (repo.language) tags.push(repo.language);
  if (repo.visibility) tags.push(repo.visibility);
  
  // Determine project status (not deployed for GitHub repos that don't have deployment info)
  const status: "success" | "failed" | "building" | "not_deployed" = "not_deployed";
  
  return {
    id: `github_${repo.id}`,
    name: repo.name,
    description: repo.description || `Repository: ${repo.name}`,
    tags,
    status,
    lastDeployed: repo.updated_at || undefined,
    repository: repo.full_name,
    repositoryUrl: repo.html_url,
    environment: 'development'
  };
}