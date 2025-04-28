"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Filter, RefreshCw, Search } from "lucide-react"

export default function LogsPage({ params }: { params: { id: string } }) {
  const [logFilter, setLogFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("1h")

  // Mock data - in a real app, this would come from your API
  const logs = [
    {
      id: "log_1",
      timestamp: "2023-11-15 14:32:45",
      level: "info",
      service: "web",
      message: "Deployment started for commit a1b2c3d",
      category: "deploy",
    },
    {
      id: "log_2",
      timestamp: "2023-11-15 14:33:12",
      level: "info",
      service: "build",
      message: "Installing dependencies...",
      category: "build",
    },
    {
      id: "log_3",
      timestamp: "2023-11-15 14:35:28",
      level: "info",
      service: "build",
      message: "Build completed successfully",
      category: "build",
    },
    {
      id: "log_4",
      timestamp: "2023-11-15 14:36:05",
      level: "info",
      service: "deploy",
      message: "Deployment successful",
      category: "deploy",
    },
    {
      id: "log_5",
      timestamp: "2023-11-15 15:12:33",
      level: "warning",
      service: "api",
      message: "High memory usage detected (85%)",
      category: "runtime",
    },
    {
      id: "log_6",
      timestamp: "2023-11-15 15:14:22",
      level: "error",
      service: "database",
      message: "Connection timeout after 30s",
      category: "runtime",
    },
    {
      id: "log_7",
      timestamp: "2023-11-15 15:15:47",
      level: "info",
      service: "api",
      message: "Service restarted automatically",
      category: "system",
    },
    {
      id: "log_8",
      timestamp: "2023-11-15 15:45:12",
      level: "debug",
      service: "web",
      message: "Cache invalidation triggered",
      category: "system",
    },
  ]

  const filteredLogs = logFilter === "all" ? logs : logs.filter((log) => log.category === logFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Logs</h2>
          <Badge className="ml-2">{logs.length}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>View and search logs for this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search logs..." className="w-full pl-8" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={logFilter} onValueChange={setLogFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Logs</SelectItem>
                  <SelectItem value="build">Build</SelectItem>
                  <SelectItem value="deploy">Deploy</SelectItem>
                  <SelectItem value="runtime">Runtime</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Last 15 min</SelectItem>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Logs</TabsTrigger>
              <TabsTrigger value="build">Build</TabsTrigger>
              <TabsTrigger value="deploy">Deploy</TabsTrigger>
              <TabsTrigger value="runtime">Runtime</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <LogTable logs={filteredLogs} />
            </TabsContent>
            <TabsContent value="build" className="mt-4">
              <LogTable logs={filteredLogs.filter((log) => log.category === "build")} />
            </TabsContent>
            <TabsContent value="deploy" className="mt-4">
              <LogTable logs={filteredLogs.filter((log) => log.category === "deploy")} />
            </TabsContent>
            <TabsContent value="runtime" className="mt-4">
              <LogTable logs={filteredLogs.filter((log) => log.category === "runtime")} />
            </TabsContent>
            <TabsContent value="system" className="mt-4">
              <LogTable logs={filteredLogs.filter((log) => log.category === "system")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LogTable({ logs }: { logs: any[] }) {
  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b">
            <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Level</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Service</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Message</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="p-4 align-middle font-mono text-xs">{log.timestamp}</td>
              <td className="p-4 align-middle">
                {log.level === "info" && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                    INFO
                  </Badge>
                )}
                {log.level === "warning" && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                    WARN
                  </Badge>
                )}
                {log.level === "error" && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                    ERROR
                  </Badge>
                )}
                {log.level === "debug" && (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                    DEBUG
                  </Badge>
                )}
              </td>
              <td className="p-4 align-middle">{log.service}</td>
              <td className="p-4 align-middle font-mono text-xs">{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
