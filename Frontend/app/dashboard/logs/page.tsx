import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Filter, Download, RefreshCw, Search } from "lucide-react"

export default function LogsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
        <div className="flex gap-2">
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

      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>View and search logs across all your projects and deployments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search logs..." className="w-full pl-8" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="1h">
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
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
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
              <LogTable logs={logs} />
            </TabsContent>
            <TabsContent value="build" className="mt-4">
              <LogTable logs={logs.filter((log) => log.category === "build")} />
            </TabsContent>
            <TabsContent value="deploy" className="mt-4">
              <LogTable logs={logs.filter((log) => log.category === "deploy")} />
            </TabsContent>
            <TabsContent value="runtime" className="mt-4">
              <LogTable logs={logs.filter((log) => log.category === "runtime")} />
            </TabsContent>
            <TabsContent value="system" className="mt-4">
              <LogTable logs={logs.filter((log) => log.category === "system")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function LogTable({ logs }: { logs: typeof logs }) {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead className="w-[100px]">Level</TableHead>
            <TableHead className="w-[150px]">Project</TableHead>
            <TableHead className="w-[150px]">Service</TableHead>
            <TableHead>Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>{log.project}</TableCell>
              <TableCell>{log.service}</TableCell>
              <TableCell className="font-mono text-xs">{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const logs = [
  {
    timestamp: "2023-11-15 14:32:45",
    level: "info",
    project: "E-commerce Frontend",
    service: "web",
    message: "Deployment started for commit a1b2c3d",
    category: "deploy",
  },
  {
    timestamp: "2023-11-15 14:33:12",
    level: "info",
    project: "E-commerce Frontend",
    service: "build",
    message: "Installing dependencies...",
    category: "build",
  },
  {
    timestamp: "2023-11-15 14:35:28",
    level: "info",
    project: "E-commerce Frontend",
    service: "build",
    message: "Build completed successfully",
    category: "build",
  },
  {
    timestamp: "2023-11-15 14:36:05",
    level: "info",
    project: "E-commerce Frontend",
    service: "deploy",
    message: "Deployment successful",
    category: "deploy",
  },
  {
    timestamp: "2023-11-15 15:12:33",
    level: "warning",
    project: "API Backend",
    service: "api",
    message: "High memory usage detected (85%)",
    category: "runtime",
  },
  {
    timestamp: "2023-11-15 15:14:22",
    level: "error",
    project: "API Backend",
    service: "database",
    message: "Connection timeout after 30s",
    category: "runtime",
  },
  {
    timestamp: "2023-11-15 15:15:47",
    level: "info",
    project: "API Backend",
    service: "api",
    message: "Service restarted automatically",
    category: "system",
  },
  {
    timestamp: "2023-11-15 15:45:12",
    level: "debug",
    project: "Marketing Website",
    service: "web",
    message: "Cache invalidation triggered",
    category: "system",
  },
  {
    timestamp: "2023-11-15 16:02:18",
    level: "info",
    project: "Marketing Website",
    service: "cdn",
    message: "CDN configuration updated",
    category: "deploy",
  },
  {
    timestamp: "2023-11-15 16:30:55",
    level: "warning",
    project: "Admin Dashboard",
    service: "auth",
    message: "Multiple failed login attempts detected",
    category: "runtime",
  },
  {
    timestamp: "2023-11-15 16:45:33",
    level: "info",
    project: "Admin Dashboard",
    service: "web",
    message: "New deployment initiated",
    category: "deploy",
  },
  {
    timestamp: "2023-11-15 16:48:21",
    level: "error",
    project: "Admin Dashboard",
    service: "build",
    message: "Build failed: Missing environment variables",
    category: "build",
  },
  {
    timestamp: "2023-11-15 17:01:09",
    level: "info",
    project: "Admin Dashboard",
    service: "system",
    message: "Environment variables updated",
    category: "system",
  },
  {
    timestamp: "2023-11-15 17:05:44",
    level: "info",
    project: "Admin Dashboard",
    service: "build",
    message: "Build restarted",
    category: "build",
  },
  {
    timestamp: "2023-11-15 17:12:37",
    level: "info",
    project: "Admin Dashboard",
    service: "deploy",
    message: "Deployment successful",
    category: "deploy",
  },
]

