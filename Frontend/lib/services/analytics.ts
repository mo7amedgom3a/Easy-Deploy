import { apiClient } from "../api-client";
import { githubService } from "./github";
export type TimeRange = "24h" | "7d" | "30d" | "90d";

export interface BaseDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsSummary {
  deployments: {
    total: number;
    successful: number;
    failed: number;
  };
  performance: {
    averageBuildTime: number;
    averageDeployTime: number;
    totalBuildMinutes: number;
  };
  resources: ResourceUsage[];
}

export interface DeviceDistribution {
  name: string;
  value: number;
}

export interface CountryDistribution {
  name: string;
  value: number;
}

export interface ResourceUsage {
  name: string;
  value: number;
  change?: number;
  originalData?: any;
}

export interface ResourceUsageOverTime {
  date: string;
  buildMinutes: number;
  bandwidth: number;
  compute: number;
}

export interface DeploymentFrequency {
  name: string;
  value: number;
}

export interface ProjectResourceUsage {
  name: string;
  buildMinutes: number;
  bandwidth: number;
  compute: number;
}

export interface PerformanceMetrics {
  mobile: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
    firstContentfulPaint: string;
    speedIndex: string;
    largestContentfulPaint: string;
    timeToInteractive: string;
    totalBlockingTime: string;
    cumulativeLayoutShift: string;
  };
  desktop: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
    pwa: number;
    firstContentfulPaint: string;
    speedIndex: string;
    largestContentfulPaint: string;
    timeToInteractive: string;
    totalBlockingTime: string;
    cumulativeLayoutShift: string;
  };
}

export const analyticsService = {
  /**
   * Get visitor analytics data points over time
   */
  async getVisitorData(timeRange: TimeRange = "7d"): Promise<BaseDataPoint[]> {
    try {
      return await apiClient.get('/analytics/visitors', { timeRange });
    } catch (error) {
      console.error('Error fetching visitor data:', error);
      return [];
    }
  },

  /**
   * Get page view data points over time
   */
  async getPageViewsData(timeRange: TimeRange = "7d"): Promise<BaseDataPoint[]> {
    try {
      return await apiClient.get('/analytics/pageviews', { timeRange });
    } catch (error) {
      console.error('Error fetching page views data:', error);
      return [];
    }
  },

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(timeRange: TimeRange = "7d"): Promise<AnalyticsSummary> {
    try {
      return await apiClient.get('/analytics/summary', { timeRange });
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      
      // Return empty data if API fails
      return {
        deployments: {
          total: 0,
          successful: 0,
          failed: 0
        },
        performance: {
          averageBuildTime: 0,
          averageDeployTime: 0,
          totalBuildMinutes: 0
        },
        resources: []
      };
    }
  },

  /**
   * Get device distribution data
   */
  async getDeviceDistribution(timeRange: TimeRange = "7d"): Promise<DeviceDistribution[]> {
    try {
      return await apiClient.get('/analytics/devices', { timeRange });
    } catch (error) {
      console.error('Error fetching device distribution:', error);
      return [];
    }
  },

  /**
   * Get country distribution data
   */
  async getCountryDistribution(timeRange: TimeRange = "7d"): Promise<CountryDistribution[]> {
    try {
      return await apiClient.get('/analytics/countries', { timeRange });
    } catch (error) {
      console.error('Error fetching country distribution:', error);
      return [];
    }
  },

  /**
   * Get analytics data for a specific project
   */
  async getProjectAnalytics(projectId: string, timeRange: TimeRange = "7d"): Promise<any> {
    try {
      return await apiClient.get(`/projects/${projectId}/analytics`, { timeRange });
    } catch (error) {
      console.error(`Error fetching analytics for project ${projectId}:`, error);
      return null;
    }
  },

  /**
   * Get resource usage data
   */
  async getResourceUsage(timeRange: TimeRange = "7d"): Promise<ResourceUsage[]> {
    try {
      const response = await apiClient.get('/analytics/resources', { timeRange });
      
      // Check if response is an array or has a resources field
      if (Array.isArray(response)) {
        return response;
      } else if (response.resources && Array.isArray(response.resources)) {
        return response.resources;
      }
      
      // If we don't get valid data from the API, generate analytics based on GitHub repositories
      return await this.generateResourceUsageFromGitHub();
    } catch (error) {
      console.error('Error fetching resource usage:', error);
      
      // Fallback to GitHub repositories for analytics
      try {
        return await this.generateResourceUsageFromGitHub();
      } catch (githubError) {
        console.error('Error generating resource usage from GitHub:', githubError);
        return [];
      }
    }
  },

  /**
   * Generate resource usage data based on GitHub repositories
   */
  async generateResourceUsageFromGitHub(): Promise<ResourceUsage[]> {
    // Get the GitHub user
    const githubUser = await githubService.getCurrentUser();
    if (!githubUser) return [];
    
    // Get GitHub repositories for the user
    const repos = await githubService.getRepositories(githubUser.login);
    if (!repos || repos.length === 0) return [];
    
    // Use repository data to generate synthetic resource usage
    const resourceData: ResourceUsage[] = [];
    
    // Use up to 5 repositories
    const reposToAnalyze = repos.slice(0, 5);
    
    for (const repo of reposToAnalyze) {
      // Generate CPU usage based on repository activity
      const lastUpdated = new Date(repo.updated_at).getTime();
      const now = new Date().getTime();
      const daysSinceUpdate = Math.floor((now - lastUpdated) / (1000 * 60 * 60 * 24));
      
      // Recent repos get higher CPU usage
      const cpuValue = Math.max(10, Math.min(95, 100 - (daysSinceUpdate * 5)));
      
      // Generate memory usage based on repository size
      const memoryValue = Math.min(90, Math.max(20, repo.size / 1000));
      
      // Add resource usage for this repository
      resourceData.push({
        name: repo.name,
        value: cpuValue,
        change: Math.floor(Math.random() * 40) - 20 // Random change between -20% and +20%
      });
    }
    
    // If we have less than 3 repositories, add generic resources
    if (resourceData.length < 3) {
      const genericResources = [
        { name: 'System CPU', value: 45, change: -5 },
        { name: 'Memory', value: 60, change: 10 },
        { name: 'Storage', value: 35, change: 2 },
        { name: 'Network', value: 70, change: 15 },
        { name: 'Database', value: 40, change: -8 }
      ];
      
      // Add enough generic resources to have at least 3
      for (let i = 0; i < (3 - resourceData.length); i++) {
        resourceData.push(genericResources[i]);
      }
    }
    
    return resourceData;
  },

  /**
   * Get resource usage over time
   */
  async getResourceUsageOverTime(timeRange: TimeRange = "7d"): Promise<ResourceUsageOverTime[]> {
    try {
      return await apiClient.get('/analytics/resources/history', { timeRange });
    } catch (error) {
      console.error('Error fetching resource usage history:', error);
      return [];
    }
  },

  /**
   * Get deployment frequency by project
   */
  async getDeploymentFrequency(timeRange: TimeRange = "7d"): Promise<DeploymentFrequency[]> {
    try {
      return await apiClient.get('/analytics/deployments/frequency', { timeRange });
    } catch (error) {
      console.error('Error fetching deployment frequency:', error);
      return [];
    }
  },

  /**
   * Get resource usage by project
   */
  async getResourceUsageByProject(timeRange: TimeRange = "7d"): Promise<ProjectResourceUsage[]> {
    try {
      return await apiClient.get('/analytics/resources/projects', { timeRange });
    } catch (error) {
      console.error('Error fetching resource usage by project:', error);
      return [];
    }
  },

  /**
   * Get performance metrics for a project
   */
  async getPerformanceMetrics(projectId: string): Promise<PerformanceMetrics> {
    try {
      return await apiClient.get(`/projects/${projectId}/performance`);
    } catch (error) {
      console.error(`Error fetching performance metrics for project ${projectId}:`, error);
      return {
        mobile: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
          pwa: 0,
          firstContentfulPaint: "0s",
          speedIndex: "0s",
          largestContentfulPaint: "0s",
          timeToInteractive: "0s",
          totalBlockingTime: "0ms",
          cumulativeLayoutShift: "0"
        },
        desktop: {
          performance: 0,
          accessibility: 0,
          bestPractices: 0,
          seo: 0,
          pwa: 0,
          firstContentfulPaint: "0s",
          speedIndex: "0s",
          largestContentfulPaint: "0s",
          timeToInteractive: "0s",
          totalBlockingTime: "0ms",
          cumulativeLayoutShift: "0"
        }
      };
    }
  }
};