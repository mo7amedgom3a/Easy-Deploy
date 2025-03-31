import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Github, MoreHorizontal, Rocket } from "lucide-react"

export function ProjectList() {
  return (
    <div className="grid gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                <CardTitle className="text-base">{project.name}</CardTitle>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </div>
            <CardDescription className="line-clamp-1 mt-1">{project.description}</CardDescription>
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
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Last deployed 2 hours ago</span>
            </div>
            <Button size="sm" className="gap-1" asChild>
              <Link href={`/dashboard/projects/${project.id}/deploy`}>
                <Rocket className="h-3.5 w-3.5" />
                <span>Deploy</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
      <Button asChild variant="outline" className="mt-2">
        <Link href="/dashboard/projects">View All Projects</Link>
      </Button>
    </div>
  )
}

const projects = [
  {
    id: "1",
    name: "E-commerce Frontend",
    description: "React-based e-commerce storefront with cart and checkout functionality",
    tags: ["React", "Next.js", "TypeScript"],
  },
  {
    id: "2",
    name: "API Backend",
    description: "RESTful API service for the e-commerce platform",
    tags: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: "3",
    name: "Marketing Website",
    description: "Company marketing website with blog and contact forms",
    tags: ["Next.js", "Tailwind CSS"],
  },
]

