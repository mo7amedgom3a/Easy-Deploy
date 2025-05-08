"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResourceUsage as ResourceUsageType, TimeRange, analyticsService } from "@/lib/services"
import { RefreshCw } from "lucide-react"

interface ProcessedResourceData {
  name: string;
  value: number;
  change?: number;
  originalData?: any;
}

export function ResourceUsage() {
  const [data, setData] = useState<ProcessedResourceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const fetchResourceUsage = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const resourceData = await analyticsService.getResourceUsage(timeRange);
      
      // Check if we received an array of data or an error message
      if (Array.isArray(resourceData)) {
        setData(resourceData);
      } else if (resourceData && 'resources' in resourceData && Array.isArray(resourceData.resources)) {
        setData(resourceData.resources);
      } else if (resourceData && 'message' in resourceData) {
        // This is an error message
        setError(resourceData.message);
        setData([]);
      } else {
        // Process the data for GitHub repositories if it's in a different format
        const processedData = processResourceData(resourceData);
        setData(processedData);
      }
    } catch (error) {
      console.error("Error fetching resource usage:", error);
      setError("Failed to load resource data. Please try again later.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to process data from different formats into a consistent structure
  const processResourceData = (rawData: any): ProcessedResourceData[] => {
    // If we get project-specific data with CPU/memory/storage metrics
    if (Array.isArray(rawData) && rawData.length > 0 && 'projectName' in rawData[0]) {
      return rawData.map(project => ({
        name: project.projectName || 'Unknown project',
        value: project.cpu?.usage || 0,
        change: project.cpu?.average ? ((project.cpu.usage / project.cpu.average) * 100) - 100 : undefined,
        originalData: project
      }));
    }
    
    // Default empty data with placeholder message
    return [];
  };

  useEffect(() => {
    fetchResourceUsage();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchResourceUsage();
  };

  // If we have an error message
  if (error && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="h-[200px] w-full flex flex-col items-center justify-center p-4 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="h-[200px] w-full flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      ) : data.length > 0 ? (
        <>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => `${value}%`}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Usage"]}
                  contentStyle={{
                    borderRadius: "6px",
                    border: "1px solid hsl(var(--border))",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
            {data.map((item, index) => (
              <div key={item.name || index} className="rounded-md border p-2 text-center">
                <div className="text-xs font-medium text-muted-foreground">
                  {item.name || `Resource ${index + 1}`}
                </div>
                <div className="text-lg font-bold">{Math.round(item.value)}%</div>
                {item.change !== undefined && (
                  <div className={`text-xs ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change > 0 ? '+' : ''}{Math.round(item.change)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[200px] w-full flex items-center justify-center">
          <p className="text-muted-foreground">No resource usage data available</p>
        </div>
      )}
    </div>
  )
}

