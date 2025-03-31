import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Github, MoreHorizontal, Rocket, XCircle } from "lucide-react"

export function ProjectTable() {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Last Deployed</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{project.description}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {project.status === "success" && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Deployed</span>
                  </div>
                )}
                {project.status === "failed" && (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">Failed</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{project.lastDeployed}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button size="sm" className="h-8 gap-1">
                    <Rocket className="h-3.5 w-3.5" />
                    <span>Deploy</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View Project</DropdownMenuItem>
                      <DropdownMenuItem>Edit Settings</DropdownMenuItem>
                      <DropdownMenuItem>View Logs</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete Project</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const projects = [
  {
    id: "1",
    name: "E-commerce Frontend",
    description: "React-based e-commerce storefront with cart and checkout functionality",
    tags: ["React", "Next.js", "TypeScript"],
    status: "success",
    lastDeployed: "2 hours ago",
  },
  {
    id: "2",
    name: "API Backend",
    description: "RESTful API service for the e-commerce platform",
    tags: ["Node.js", "Express", "MongoDB"],
    status: "failed",
    lastDeployed: "1 day ago",
  },
  {
    id: "3",
    name: "Marketing Website",
    description: "Company marketing website with blog and contact forms",
    tags: ["Next.js", "Tailwind CSS"],
    status: "success",
    lastDeployed: "3 hours ago",
  },
  {
    id: "4",
    name: "Admin Dashboard",
    description: "Internal admin dashboard for managing products and orders",
    tags: ["React", "Material UI", "Redux"],
    status: "success",
    lastDeployed: "5 days ago",
  },
  {
    id: "5",
    name: "Mobile App Backend",
    description: "API services for the mobile application",
    tags: ["Node.js", "Express", "PostgreSQL"],
    status: "success",
    lastDeployed: "1 week ago",
  },
]

