import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Filter,
  MoreHorizontal,
  RefreshCw,
  RotateCw,
  Search,
  XCircle,
} from "lucide-react"

export default function DeploymentsPage({ params }: { params: { id: string } }) {
  // This would come from your API in a real app
  const deployments = [
    {
      id: "dep_123",
      status: "success",
      branch: "main",
      commit: "a1b2c3d4e5f6g7h8i9j0",
      commitMessage: "Update product listing component and fix cart bug",
      author: "John Doe",
      timestamp: "2 hours ago",
      duration: "1m 45s",
    },
    {
      id: "dep_122",
      status: "failed",
      branch: "feature/checkout",
      commit: "b2c3d4e5f6g7h8i9j0k1",
      commitMessage: "Implement new checkout flow",
      author: "Jane Smith",
      timestamp: "5 hours ago",
      duration: "2m 12s",
    },
    {
      id: "dep_121",
      status: "success",
      branch: "main",
      commit: "c3d4e5f6g7h8i9j0k1l2",
      commitMessage: "Fix mobile responsiveness issues",
      author: "John Doe",
      timestamp: "1 day ago",
      duration: "1m 38s",
    },
    {
      id: "dep_120",
      status: "success",
      branch: "main",
      commit: "d4e5f6g7h8i9j0k1l2m3",
      commitMessage: "Update dependencies and security patches",
      author: "Jane Smith",
      timestamp: "2 days ago",
      duration: "1m 52s",
    },
    {
      id: "dep_119",
      status: "building",
      branch: "feature/analytics",
      commit: "e5f6g7h8i9j0k1l2m3n4",
      commitMessage: "Add analytics dashboard components",
      author: "Mike Johnson",
      timestamp: "just now",
      duration: "running...",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Deployments</h2>
          <Badge className="ml-2">{deployments.length}</Badge>
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
          <Button size="sm" className="gap-1.5">
            <RotateCw className="h-3.5 w-3.5" />
            <span>Deploy</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment History</CardTitle>
          <CardDescription>View and manage all deployments for this project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search deployments..." className="w-full pl-8" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="feature">feature/*</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters</span>
              </Button>
            </div>
          </div>

          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead>
                <tr className="border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Branch</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Commit</th>
                  <th className="h-12 px-4 text-left align-middle font-medium hidden md:table-cell">Message</th>
                  <th className="h-12 px-4 text-left align-middle font-medium hidden lg:table-cell">Author</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                  <th className="h-12 px-4 text-left align-middle font-medium hidden sm:table-cell">Duration</th>
                  <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((deployment) => (
                  <tr key={deployment.id} className="border-b">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        {deployment.status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {deployment.status === "failed" && <XCircle className="h-4 w-4 text-destructive" />}
                        {deployment.status === "building" && <Clock className="h-4 w-4 text-orange-500 animate-spin" />}
                        <span>
                          {deployment.status === "success" && "Success"}
                          {deployment.status === "failed" && "Failed"}
                          {deployment.status === "building" && "Building"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">{deployment.branch}</td>
                    <td className="p-4 align-middle font-mono text-xs">{deployment.commit.substring(0, 7)}</td>
                    <td className="p-4 align-middle hidden md:table-cell">
                      <span className="truncate block max-w-[200px]">{deployment.commitMessage}</span>
                    </td>
                    <td className="p-4 align-middle hidden lg:table-cell">{deployment.author}</td>
                    <td className="p-4 align-middle">{deployment.timestamp}</td>
                    <td className="p-4 align-middle hidden sm:table-cell">{deployment.duration}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View deployment</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <RotateCw className="h-4 w-4" />
                          <span className="sr-only">Redeploy</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
