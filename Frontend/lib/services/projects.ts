import { apiClient } from "../api-client";

export interface Project {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: "success" | "failed" | "building";
  lastDeployed?: string;
  repository?: string;
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
      return await apiClient.get('/projects/');
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  /**
   * Get a project by ID
   */
  async getProjectById(id: string): Promise<Project | null> {
    try {
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