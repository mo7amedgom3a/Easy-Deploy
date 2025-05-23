"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CheckCircle2, Github, MoreHorizontal, Rocket, XCircle, Loader2, AlertCircle, Clock, RefreshCw, ExternalLink } from "lucide-react"
import { projectsService, Project, ApiErrorResponse } from "@/lib/services/projects"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await projectsService.getProjects()

      if ("error" in result) {
        const errorResult = result as ApiErrorResponse
        setError(errorResult.error)
        console.error("Error fetching projects:", errorResult)
        
        // Show a more user-friendly toast message
        if (retryCount === 0) {
          toast({
            title: "Connection Issue",
            description: "Unable to connect to the backend. Showing GitHub repositories instead.",
            variant: "default"
          })
        }
      } else {
        const projectsArray = result as Project[]
        setProjects(projectsArray)
        console.log(`Loaded ${projectsArray.length} projects`)
        
        // Reset retry count on success
        setRetryCount(0)
        
        // Show success message if this was a retry
        if (retryCount > 0) {
          toast({
            title: "Connection Restored",
            description: `Successfully loaded ${projectsArray.length} projects`,
          })
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch projects"
      setError(errorMessage)
      console.error("Error fetching projects:", err)
      
      toast({
        title: "Error Loading Projects",
        description: "There was a problem loading your projects. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchProjects()
  }

  const getStatusIcon = (status: Project["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />
      case "building":
        return <Clock className="h-4 w-4 text-orange-500 animate-spin" />
      case "not_deployed":
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusText = (status: Project["status"]) => {
    switch (status) {
      case "success":
        return "Deployed"
      case "failed":
        return "Failed"
      case "building":
        return "Building"
      case "not_deployed":
      default:
        return "Not Deployed"
    }
  }

  const getStatusVariant = (status: Project["status"]) => {
    switch (status) {
      case "success":
        return "default"
      case "failed":
        return "destructive"
      case "building":
        return "secondary"
      case "not_deployed":
      default:
        return "outline"
    }
  }

  const isGitHubRepo = (project: Project) => {
    return project.id.startsWith('github_') && project.status === 'not_deployed'
  }

  const handleDeploy = async (project: Project) => {
    toast({
      title: "Deployment Started",
      description: `Starting deployment for ${project.name}`,
    })
    // TODO: Implement actual deployment logic
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded" />
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          {error.includes("Failed to fetch projects") 
            ? "Backend unavailable. Showing GitHub repositories."
            : error
          }
        </p>
        <Button onClick={handleRetry} variant="outline" size="sm">
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Github className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">No projects found</p>
        <Button asChild size="sm">
          <Link href="/dashboard/projects/new">
            <Rocket className="h-3 w-3 mr-1" />
            Create Project
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projects.slice(0, 5).map((project) => (
        <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <Github className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-sm">{project.name}</div>
              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                {project.description}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant(project.status)} className="text-xs">
              {getStatusText(project.status)}
            </Badge>
            {isGitHubRepo(project) ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-6 text-xs gap-1"
                onClick={() => handleDeploy(project)}
              >
                <Rocket className="h-3 w-3" />
                Deploy
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                <Link href={`/dashboard/projects/${project.id}`}>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      ))}
      {projects.length > 5 && (
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href="/dashboard/projects">
              View all {projects.length} projects
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

