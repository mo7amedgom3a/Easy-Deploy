"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResourceUsage as ResourceUsageType, TimeRange, analyticsService } from "@/lib/services"
import { RefreshCw } from "lucide-react"

export function ResourceUsage() {
  const [data, setData] = useState<ResourceUsageType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");

  const fetchResourceUsage = async () => {
    setIsLoading(true);
    try {
      const resourceData = await analyticsService.getResourceUsage(timeRange);
      setData(resourceData);
    } catch (error) {
      console.error("Error fetching resource usage:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResourceUsage();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchResourceUsage();
  };

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
      ) : (
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

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {data.map((item) => (
              <div key={item.name} className="rounded-md border p-2 text-center">
                <div className="text-xs font-medium text-muted-foreground">{item.name}</div>
                <div className="text-lg font-bold">{Math.round(item.value)}%</div>
                {item.change !== undefined && (
                  <div className={`text-xs ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change > 0 ? '+' : ''}{item.change}%
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

