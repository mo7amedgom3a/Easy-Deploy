import { apiClient } from "../api-client";

export interface Log {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  project?: string;
  projectId?: string;
  service: string;
  message: string;
  category: "build" | "deploy" | "runtime" | "system";
}

export type LogFilter = "all" | "build" | "deploy" | "runtime" | "system";
export type TimeRange = "15m" | "1h" | "24h" | "7d" | "30d";

export const logsService = {
  /**
   * Get all logs
   */
  async getLogs(filter: LogFilter = "all", timeRange: TimeRange = "24h"): Promise<Log[]> {
    try {
      const params: Record<string, string> = {
        timeRange
      };
      
      if (filter !== "all") {
        params.category = filter;
      }
      
      return await apiClient.get('/logs/', params);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  },

  /**
   * Get logs for a specific project
   */
  async getProjectLogs(projectId: string, filter: LogFilter = "all", timeRange: TimeRange = "24h"): Promise<Log[]> {
    try {
      const params: Record<string, string> = {
        timeRange
      };
      
      if (filter !== "all") {
        params.category = filter;
      }
      
      return await apiClient.get(`/projects/${projectId}/logs`, params);
    } catch (error) {
      console.error(`Error fetching logs for project ${projectId}:`, error);
      return [];
    }
  },

  /**
   * Export logs as CSV
   */
  async exportLogs(filter: LogFilter = "all", timeRange: TimeRange = "24h"): Promise<Blob> {
    const params: Record<string, string> = {
      timeRange,
      format: 'csv'
    };
    
    if (filter !== "all") {
      params.category = filter;
    }
    
    // Get the token for authentication
    const tokenResponse = await fetch('/api/auth/token', {
      method: 'GET',
      credentials: 'include'
    }).then(res => res.json())
      .catch(() => ({ token: null }));
    
    // Direct fetch to get the blob
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/logs/export`, {
      method: 'GET',
      headers: {
        ...(tokenResponse.token ? { 'Authorization': `Bearer ${tokenResponse.token}` } : {})
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export logs');
    }
    
    return await response.blob();
  }
};