import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Clock, ExternalLink, RotateCcw, XCircle } from "lucide-react"

export function DeploymentHistory() {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Commit</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell className="font-medium">{deployment.project}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {deployment.status === "success" && (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Success
                      </Badge>
                    </>
                  )}
                  {deployment.status === "failed" && (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                        Failed
                      </Badge>
                    </>
                  )}
                  {deployment.status === "building" && (
                    <>
                      <Clock className="h-4 w-4 text-orange-500 animate-spin" />
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
                        Building
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>{deployment.branch}</TableCell>
              <TableCell className="font-mono text-xs">{deployment.commit.substring(0, 7)}</TableCell>
              <TableCell>{deployment.author}</TableCell>
              <TableCell>{deployment.time}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">View deployment</span>
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <RotateCcw className="h-4 w-4" />
                    <span className="sr-only">Redeploy</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const deployments = [
  {
    id: "1",
    project: "E-commerce Frontend",
    status: "success",
    branch: "main",
    commit: "a1b2c3d4e5f6g7h8i9j0",
    author: "John Doe",
    time: "2 minutes ago",
  },
  {
    id: "2",
    project: "API Backend",
    status: "failed",
    branch: "feature/auth",
    commit: "b2c3d4e5f6g7h8i9j0k1",
    author: "Sarah Johnson",
    time: "15 minutes ago",
  },
  {
    id: "3",
    project: "Marketing Website",
    status: "success",
    branch: "main",
    commit: "c3d4e5f6g7h8i9j0k1l2",
    author: "Mike Chen",
    time: "1 hour ago",
  },
  {
    id: "4",
    project: "Admin Dashboard",
    status: "building",
    branch: "develop",
    commit: "d4e5f6g7h8i9j0k1l2m3",
    author: "Emily Wilson",
    time: "just now",
  },
  {
    id: "5",
    project: "Mobile App Backend",
    status: "success",
    branch: "main",
    commit: "e5f6g7h8i9j0k1l2m3n4",
    author: "Alex Rodriguez",
    time: "3 hours ago",
  },
  {
    id: "6",
    project: "Analytics Service",
    status: "failed",
    branch: "feature/reports",
    commit: "f6g7h8i9j0k1l2m3n4o5",
    author: "Lisa Taylor",
    time: "5 hours ago",
  },
  {
    id: "7",
    project: "User Authentication",
    status: "success",
    branch: "main",
    commit: "g7h8i9j0k1l2m3n4o5p6",
    author: "David Rodriguez",
    time: "1 day ago",
  },
  {
    id: "8",
    project: "Payment Gateway",
    status: "success",
    branch: "main",
    commit: "h8i9j0k1l2m3n4o5p6q7",
    author: "Emma Thompson",
    time: "2 days ago",
  },
]

