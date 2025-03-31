import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, Github, MoreHorizontal, Rocket, XCircle } from "lucide-react"

export function ProjectGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                <CardTitle className="text-base">{project.name}</CardTitle>
              </div>
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
            <CardDescription className="line-clamp-2 mt-1">{project.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {project.status === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Deployed</span>
                </>
              )}
              {project.status === "failed" && (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>Failed</span>
                </>
              )}
            </div>
            <Button size="sm" className="gap-1">
              <Rocket className="h-3.5 w-3.5" />
              <span>Deploy</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
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
  },
  {
    id: "2",
    name: "API Backend",
    description: "RESTful API service for the e-commerce platform",
    tags: ["Node.js", "Express", "MongoDB"],
    status: "failed",
  },
  {
    id: "3",
    name: "Marketing Website",
    description: "Company marketing website with blog and contact forms",
    tags: ["Next.js", "Tailwind CSS"],
    status: "success",
  },
  {
    id: "4",
    name: "Admin Dashboard",
    description: "Internal admin dashboard for managing products and orders",
    tags: ["React", "Material UI", "Redux"],
    status: "success",
  },
  {
    id: "5",
    name: "Mobile App Backend",
    description: "API services for the mobile application",
    tags: ["Node.js", "Express", "PostgreSQL"],
    status: "success",
  },
  {
    id: "6",
    name: "Analytics Service",
    description: "Data processing and analytics service for business intelligence",
    tags: ["Python", "FastAPI", "Pandas"],
    status: "failed",
  },
]

