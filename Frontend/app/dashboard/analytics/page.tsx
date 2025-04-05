"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
} from "recharts"
import { Download, RefreshCw } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Deployments"
          value="1,248"
          change="+12%"
          trend="up"
          description="vs. previous period"
        />
        <MetricCard title="Build Minutes" value="8,540" change="+8%" trend="up" description="vs. previous period" />
        <MetricCard title="Bandwidth Used" value="256 GB" change="+15%" trend="up" description="vs. previous period" />
        <MetricCard
          title="Avg. Deploy Time"
          value="1m 24s"
          change="-18%"
          trend="down"
          description="vs. previous period"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Resource Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deployments Over Time</CardTitle>
                <CardDescription>Number of deployments by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={deploymentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border))",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 0 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Status</CardTitle>
                <CardDescription>Success vs. failure rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}`, "Count"]}
                        contentStyle={{
                          borderRadius: "6px",
                          border: "1px solid hsl(var(--border))",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Usage by Project</CardTitle>
              <CardDescription>Build minutes, bandwidth, and compute resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectUsageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="buildMinutes" name="Build Minutes" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bandwidth" name="Bandwidth (GB)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="compute" name="Compute (hrs)" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Frequency</CardTitle>
              <CardDescription>Number of deployments by project</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deploymentFrequencyData}
                    layout="vertical"
                    margin={{ top: 10, right: 10, left: 100, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" fontSize={12} tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Build Performance</CardTitle>
              <CardDescription>Average build times by project (in seconds)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={buildPerformanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => [`${value} seconds`, "Build Time"]}
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Consumption Trends</CardTitle>
              <CardDescription>Usage patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={resourceTrendsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "6px",
                        border: "1px solid hsl(var(--border))",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="buildMinutes"
                      name="Build Minutes"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bandwidth"
                      name="Bandwidth (GB)"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="compute"
                      name="Compute (hrs)"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  trend,
  description,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  description: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>{change}</span>
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

// Mock data for charts
const deploymentData = [
  { date: "Nov 1", value: 12 },
  { date: "Nov 2", value: 19 },
  { date: "Nov 3", value: 15 },
  { date: "Nov 4", value: 8 },
  { date: "Nov 5", value: 10 },
  { date: "Nov 6", value: 14 },
  { date: "Nov 7", value: 18 },
  { date: "Nov 8", value: 21 },
  { date: "Nov 9", value: 17 },
  { date: "Nov 10", value: 14 },
  { date: "Nov 11", value: 11 },
  { date: "Nov 12", value: 13 },
  { date: "Nov 13", value: 16 },
  { date: "Nov 14", value: 19 },
  { date: "Nov 15", value: 22 },
]

const statusData = [
  { name: "Success", value: 219, color: "#10b981" },
  { name: "Failed", value: 29, color: "#ef4444" },
  { name: "Canceled", value: 12, color: "#f59e0b" },
]

const projectUsageData = [
  { name: "E-commerce", buildMinutes: 1240, bandwidth: 45, compute: 120 },
  { name: "API Backend", buildMinutes: 980, bandwidth: 32, compute: 95 },
  { name: "Marketing", buildMinutes: 560, bandwidth: 28, compute: 65 },
  { name: "Admin", buildMinutes: 890, bandwidth: 18, compute: 78 },
  { name: "Mobile App", buildMinutes: 1100, bandwidth: 22, compute: 88 },
]

const deploymentFrequencyData = [
  { name: "E-commerce Frontend", value: 78 },
  { name: "API Backend", value: 65 },
  { name: "Marketing Website", value: 42 },
  { name: "Admin Dashboard", value: 56 },
  { name: "Mobile App Backend", value: 38 },
  { name: "Analytics Service", value: 25 },
  { name: "User Authentication", value: 31 },
  { name: "Payment Gateway", value: 19 },
]

const buildPerformanceData = [
  { name: "E-commerce", value: 95 },
  { name: "API Backend", value: 42 },
  { name: "Marketing", value: 68 },
  { name: "Admin", value: 112 },
  { name: "Mobile App", value: 78 },
]

const resourceTrendsData = [
  { date: "Week 1", buildMinutes: 1200, bandwidth: 35, compute: 90 },
  { date: "Week 2", buildMinutes: 1350, bandwidth: 38, compute: 95 },
  { date: "Week 3", buildMinutes: 1500, bandwidth: 42, compute: 105 },
  { date: "Week 4", buildMinutes: 1650, bandwidth: 45, compute: 110 },
  { date: "Week 5", buildMinutes: 1800, bandwidth: 48, compute: 115 },
  { date: "Week 6", buildMinutes: 2100, bandwidth: 52, compute: 125 },
  { date: "Week 7", buildMinutes: 2300, bandwidth: 58, compute: 135 },
  { date: "Week 8", buildMinutes: 2450, bandwidth: 62, compute: 145 },
]

