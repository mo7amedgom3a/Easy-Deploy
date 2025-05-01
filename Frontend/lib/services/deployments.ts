import { apiClient } from "../api-client";

export interface Deployment {
  id: string;
  projectId?: string;
  project?: string;
  status: "success" | "failed" | "building" | "canceled";
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
      return await apiClient.get('/deployments/');
    } catch (error) {
      console.error('Error fetching deployments:', error);
      return [];
    }
  },

  /**
   * Get deployments for a specific project
   */
  async getProjectDeployments(projectId: string): Promise<Deployment[]> {
    try {
      return await apiClient.get(`/projects/${projectId}/deployments`);
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
      return await apiClient.get('/deployments/recent', { limit: limit.toString() });
    } catch (error) {
      console.error('Error fetching recent deployments:', error);
      return [];
    }
  },

  /**
   * Get a deployment by ID
   */
  async getDeploymentById(id: string): Promise<Deployment | null> {
    try {
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
      return await apiClient.get('/deployments/stats');
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
    return await apiClient.post(`/deployments/${deploymentId}/redeploy`);
  }
};