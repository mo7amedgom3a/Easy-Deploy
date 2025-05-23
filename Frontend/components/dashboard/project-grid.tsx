"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle2,
  Clock,
  Github,
  Globe,
  MoreHorizontal,
  Rocket,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import Link from "next/link"
import { projectsService, Project, ApiErrorResponse } from "@/lib/services/projects"

export function ProjectGrid() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await projectsService.getProjects()
      
      if (Array.isArray(result)) {
        setProjects(result)
      } else if (result && 'error' in result) {
        setError(result.error)
        setProjects([])
      } else {
        setError("Unexpected response format")
        setProjects([])
      }
    } catch (err) {
      console.error("Error fetching projects:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch projects")
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const isGitHubRepo = (project: Project) => {
    return project.id.startsWith('github_') && project.status === 'not_deployed'
  }

  const handleDeploy = async (project: Project) => {
    // Implement deploy logic here
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "success":
        return "green"
      case "failed":
        return "red"
      case "building":
        return "orange"
      case "not_deployed":
        return "gray"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "building":
        return <Clock className="h-4 w-4 text-orange-500 animate-spin" />
      case "not_deployed":
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Deployed"
      case "failed":
        return "Failed"
      case "building":
        return "Building"
      case "not_deployed":
        return "Not Deployed"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchProjects}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <Github className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first project from a GitHub repository.
        </p>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Rocket className="h-4 w-4 mr-2" />
            Create Project
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="group hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-sm">
                    {project.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={getStatusVariant(project.status)}>
                {getStatusIcon(project.status)}
                {getStatusText(project.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {project.lastDeployed ? (
                    `Updated ${new Date(project.lastDeployed).toLocaleDateString()}`
                  ) : (
                    "Never deployed"
                  )}
                </span>
                {project.environment && (
                  <Badge variant="outline" className="text-xs">
                    {project.environment}
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                {isGitHubRepo(project) ? (
                  <>
                    <Button 
                      className="flex-1 gap-1.5" 
                      onClick={() => handleDeploy(project)}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      Deploy Now
                    </Button>
                    {project.repositoryUrl && (
                      <Button variant="outline" size="icon" asChild>
                        <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        View Project
                      </Link>
                    </Button>
                    <Button 
                      size="icon" 
                      onClick={() => handleDeploy(project)}
                      disabled={project.status === "building"}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// If you have dynamic imports, ensure they're correct
// Example of proper dynamic import:
// const DynamicComponent = dynamic(() => import('./SomeComponent'), {
//   loading: () => <p>Loading...</p>
// })

