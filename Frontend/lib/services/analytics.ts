import { apiClient } from "../api-client";

export type TimeRange = "24h" | "7d" | "30d" | "90d";

export interface BaseDataPoint {
  date: string;
  value: number;
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalVisitorsChange: number;
  pageViews: number;
  pageViewsChange: number;
  avgSessionDuration: string;
  avgSessionDurationChange: number;
  bounceRate: number;
  bounceRateChange: number;
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
   * Get analytics summary statistics
   */
  async getAnalyticsSummary(timeRange: TimeRange = "7d"): Promise<AnalyticsSummary> {
    try {
      return await apiClient.get('/analytics/summary', { timeRange });
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      return {
        totalVisitors: 0,
        totalVisitorsChange: 0,
        pageViews: 0,
        pageViewsChange: 0,
        avgSessionDuration: "0m 0s",
        avgSessionDurationChange: 0,
        bounceRate: 0,
        bounceRateChange: 0
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
   * Get project-specific analytics
   */
  async getProjectAnalytics(projectId: string, timeRange: TimeRange = "7d"): Promise<{
    visitors: BaseDataPoint[];
    pageViews: BaseDataPoint[];
    summary: AnalyticsSummary;
    devices: DeviceDistribution[];
    countries: CountryDistribution[];
  }> {
    try {
      return await apiClient.get(`/projects/${projectId}/analytics`, { timeRange });
    } catch (error) {
      console.error(`Error fetching analytics for project ${projectId}:`, error);
      return {
        visitors: [],
        pageViews: [],
        summary: {
          totalVisitors: 0,
          totalVisitorsChange: 0,
          pageViews: 0,
          pageViewsChange: 0,
          avgSessionDuration: "0m 0s",
          avgSessionDurationChange: 0,
          bounceRate: 0,
          bounceRateChange: 0
        },
        devices: [],
        countries: []
      };
    }
  },

  /**
   * Get resource usage statistics
   */
  async getResourceUsage(timeRange: TimeRange = "7d"): Promise<ResourceUsage[]> {
    try {
      return await apiClient.get('/analytics/resources', { timeRange });
    } catch (error) {
      console.error('Error fetching resource usage:', error);
      return [];
    }
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