import { apiClient } from "../api-client";
import { githubService } from "./github";

export interface Deployment {
  id: string;
  projectId?: string;
  project?: string;
  status: "success" | "failed" | "building" | "canceled" | "not_deployed";
  branch: string;
  commit: string;
  commitMessage?: string;
  author?: string;
  timestamp: string;
  time?: string;
  duration?: string;
}

export interface DeploymentStats {
  total: number;
  successful: number;
  failed: number;
  inProgress: number;
  successRate: number;
}

export const deploymentsService = {
  /**
   * Get all deployments
   */
  async getDeployments(): Promise<Deployment[]> {
    try {
      const response = await apiClient.get('/deployments/');
      
      // Check if response is an array (deployments data) or has a message field (error)
      if (Array.isArray(response)) {
        return response;
      } else if (response.deployments && Array.isArray(response.deployments)) {
        return response.deployments;
      } else if (response.message) {
        console.log('API message:', response.message);
        
        // Fallback to GitHub commits as "deployments"
        return await this.getRecentGitHubActivity();
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching deployments:', error);
      
      // Fallback to GitHub commits as "deployments"
      try {
        return await this.getRecentGitHubActivity();
      } catch (githubError) {
        console.error('Error fetching GitHub activity:', githubError);
        return [];
      }
    }
  },

  /**
   * Get deployments for a specific project
   */
  async getProjectDeployments(projectId: string): Promise<Deployment[]> {
    try {
      // Check if it's a GitHub repository ID
      if (projectId.startsWith('github_')) {
        const githubId = projectId.replace('github_', '');
        const githubUser = await githubService.getCurrentUser();
        
        if (githubUser && githubUser.login) {
          // Get all repositories and find the matching one
          const repos = await githubService.getRepositories(githubUser.login);
          const repo = repos.find(r => r.id.toString() === githubId);
          
          if (repo) {
            // Get recent commits for this repository
            const commits = await githubService.getCommits(
              githubUser.login,
              repo.name,
              repo.default_branch || 'main'
            );
            
            // Convert commits to deployment format
            return commits.slice(0, 10).map((commit, index) => ({
              id: `commit_${commit.sha}`,
              projectId,
              project: repo.name,
              status: "not_deployed",
              branch: repo.default_branch || 'main',
              commit: commit.sha,
              commitMessage: commit.commit?.message,
              author: commit.commit?.author?.name || commit.author?.login || githubUser.login,
              timestamp: commit.commit?.author?.date || new Date().toISOString(),
              time: formatTimeAgo(commit.commit?.author?.date)
            }));
          }
        }
        return [];
      }
      
      // Regular project ID
      const response = await apiClient.get(`/projects/${projectId}/deployments`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error(`Error fetching deployments for project ${projectId}:`, error);
      return [];
    }
  },
  
  /**
   * Get recent deployments (limited to a certain number)
   */
  async getRecentDeployments(limit: number = 5): Promise<Deployment[]> {
    try {
      const response = await apiClient.get('/deployments/recent', { limit: limit.toString() });
      
      // Check if response is an array (deployments data) or has a message field (error)
      if (Array.isArray(response)) {
        return response;
      } else if (response.deployments && Array.isArray(response.deployments)) {
        return response.deployments;
      } else if (response.message) {
        console.log('API message:', response.message);
        
        // Fallback to GitHub commits as "deployments"
        return await this.getRecentGitHubActivity(limit);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching recent deployments:', error);
      
      // Fallback to GitHub commits as "deployments"
      try {
        return await this.getRecentGitHubActivity(limit);
      } catch (githubError) {
        console.error('Error fetching GitHub activity:', githubError);
        return [];
      }
    }
  },

  /**
   * Get a deployment by ID
   */
  async getDeploymentById(id: string): Promise<Deployment | null> {
    try {
      // Check if it's a GitHub commit ID
      if (id.startsWith('commit_')) {
        const commitSha = id.replace('commit_', '');
        const githubUser = await githubService.getCurrentUser();
        
        if (githubUser && githubUser.login) {
          // This is more complex as we need to find which repo this commit belongs to
          // For now, return a basic structure
          return {
            id,
            status: "not_deployed",
            branch: 'unknown',
            commit: commitSha,
            author: githubUser.login,
            timestamp: new Date().toISOString(),
          };
        }
        return null;
      }
      
      // Regular deployment ID
      return await apiClient.get(`/deployments/${id}`);
    } catch (error) {
      console.error(`Error fetching deployment ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new deployment
   */
  async createDeployment(deployment: Partial<Deployment>): Promise<Deployment> {
    return await apiClient.post('/deployments/', deployment);
  },

  /**
   * Get deployment statistics (total, success rate, etc.)
   */
  async getDeploymentStats(): Promise<DeploymentStats> {
    try {
      const response = await apiClient.get('/deployments/stats');
      
      if (response && typeof response === 'object' && 'total' in response) {
        return response;
      }
      
      // If real stats aren't available, generate based on GitHub activity
      const commits = await this.getRecentGitHubActivity(20);
      return {
        total: commits.length,
        successful: commits.length,
        failed: 0,
        inProgress: 0,
        successRate: 100
      };
    } catch (error) {
      console.error('Error fetching deployment stats:', error);
      return {
        total: 0,
        successful: 0,
        failed: 0,
        inProgress: 0,
        successRate: 0
      };
    }
  },
  
  /**
   * Redeploy a specific deployment
   */
  async redeploy(deploymentId: string): Promise<Deployment> {
    try {
      return await apiClient.post(`/deployments/${deploymentId}/redeploy`);
    } catch (error) {
      console.error(`Error redeploying deployment ${deploymentId}:`, error);
      throw error;
    }
  },
  
  /**
   * Get recent GitHub activity (commits) as "deployments"
   */
  async getRecentGitHubActivity(limit: number = 5): Promise<Deployment[]> {
    // Get GitHub user
    const githubUser = await githubService.getCurrentUser();
    if (!githubUser || !githubUser.login) return [];
    
    // Get repositories
    const repos = await githubService.getRepositories(githubUser.login);
    if (!repos || repos.length === 0) return [];
    
    // Get recent activity from repositories
    const recentActivity: Deployment[] = [];
    const reposToCheck = Math.min(repos.length, 3); // Check up to 3 repos
    
    for (let i = 0; i < reposToCheck && recentActivity.length < limit; i++) {
      const repo = repos[i];
      try {
        // Get commits from the default branch
        const commits = await githubService.getCommits(
          githubUser.login,
          repo.name,
          repo.default_branch || 'main'
        );
        
        // Take a few recent commits from this repo
        const repoCommits: Deployment[] = commits.slice(0, 3).map(commit => ({
          id: `commit_${commit.sha}`,
          projectId: `github_${repo.id}`,
          project: repo.name,
          status: "not_deployed", // Mark as not actually deployed
          branch: repo.default_branch || 'main',
          commit: commit.sha || '',
          commitMessage: commit.commit?.message,
          author: commit.commit?.author?.name || commit.author?.login || githubUser.login,
          timestamp: commit.commit?.author?.date || new Date().toISOString(),
          time: formatTimeAgo(commit.commit?.author?.date)
        }));
        
        recentActivity.push(...repoCommits);
      } catch (error) {
        console.error(`Error fetching commits for ${repo.name}:`, error);
      }
    }
    
    // Sort by timestamp (newest first) and limit
    return recentActivity
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
};

/**
 * Format a date string as a relative time (e.g., "2 hours ago")
 */
function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (isNaN(secondsAgo) || secondsAgo < 0) {
    return 'Unknown time';
  }
  
  if (secondsAgo < 60) {
    return `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`;
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) {
    return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
  }
  
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo} month${monthsAgo === 1 ? '' : 's'} ago`;
  }
  
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`;
}