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

export const projectsService = {
  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      const response = await apiClient.get('/projects/');
      
      // Check if response is an array (projects data) or has a message field (error)
      if (Array.isArray(response)) {
        return response;
      } else if (response.projects && Array.isArray(response.projects)) {
        return response.projects;
      } else if (response.message) {
        console.log('API message:', response.message);
        
        // If no projects found, try to get GitHub repositories as fallback
        const githubUser = await githubService.getCurrentUser();
        if (githubUser && githubUser.login) {
          const repos = await githubService.getRepositories(githubUser.login);
          
          // Convert GitHub repositories to project format
          return repos.map(repo => convertRepoToProject(repo));
        }
        
        return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      
      // Try to get GitHub repositories as fallback
      try {
        const githubUser = await githubService.getCurrentUser();
        if (githubUser && githubUser.login) {
          const repos = await githubService.getRepositories(githubUser.login);
          
          // Convert GitHub repositories to project format
          return repos.map(repo => convertRepoToProject(repo));
        }
      } catch (githubError) {
        console.error('Error fetching GitHub repositories:', githubError);
      }
      
      return [];
    }
  },

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
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
      return await apiClient.get(`/projects/${id}`);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new project
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    return await apiClient.post('/projects/', project);
  },

  /**
   * Update a project
   */
  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return await apiClient.put(`/projects/${id}`, project);
  },

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
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