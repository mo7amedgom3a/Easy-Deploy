"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Github, MoreHorizontal, Rocket, XCircle, Clock } from "lucide-react"
import { Project, projectsService } from "@/lib/services"

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await projectsService.getProjects();
        // If we need to limit the number of projects displayed on dashboard
        setProjects(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full p-8 flex justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No GitHub repositories found</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/projects/new">Connect GitHub Repository</Link>
        </Button>
      </div>
    );
  }

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
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href={`/dashboard/projects/${project.id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Link>
              </Button>
            </div>
            <CardDescription className="line-clamp-1 mt-1">
              {project.description || `Repository: ${project.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-2">
              {project.tags && project.tags.length > 0 ? (
                project.tags.map((tag, index) => (
                  <Badge key={`${project.id}-tag-${index}`} variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary">No tags</Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {project.status === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Deployed successfully</span>
                </>
              )}
              {project.status === "failed" && (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>Deployment failed</span>
                </>
              )}
              {project.status === "building" && (
                <>
                  <Clock className="h-4 w-4 text-orange-500 animate-spin" />
                  <span>Deploying...</span>
                </>
              )}
              {project.status === "not_deployed" && (
                <>
                  <Github className="h-4 w-4" />
                  <span>Not deployed yet</span>
                </>
              )}
              {project.lastDeployed && (
                <span className="ml-2 text-muted-foreground">
                  ({formatDate(project.lastDeployed)})
                </span>
              )}
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
      {projects.length > 0 && (
        <Button asChild variant="outline" className="mt-2">
          <Link href="/dashboard/projects">View All Projects</Link>
        </Button>
      )}
    </div>
  )
}

// Helper function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

