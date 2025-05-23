"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Github, MoreHorizontal, Rocket, XCircle, Loader2, AlertCircle, Clock, RefreshCw, ExternalLink } from "lucide-react"
import { projectsService, Project, ApiErrorResponse } from "@/lib/services/projects"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectGridProps {
  searchQuery?: string
}

export function ProjectGrid({ searchQuery = "" }: ProjectGridProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const { toast } = useToast()

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

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    if (!searchQuery.trim()) return true
    
    const query = searchQuery.toLowerCase()
    return (
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query)) ||
      (project.repositoryUrl && project.repositoryUrl.toLowerCase().includes(query)) ||
      (project.tags && project.tags.some(tag => tag.toLowerCase().includes(query))) ||
      (project.framework && project.framework.toLowerCase().includes(query))
    )
  })

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1 rounded" />
                  <Skeleton className="h-9 w-9 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Load Projects</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {error.includes("Failed to fetch projects") 
            ? "The backend service appears to be unavailable. This might be because the backend server is not running."
            : error
          }
        </p>
        <div className="flex gap-2">
          <Button onClick={handleRetry} variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Try Again
          </Button>
          <Button asChild variant="default">
            <Link href="/dashboard/projects/new">
              <Rocket className="h-4 w-4 mr-2" />
              Create New Project
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Tip: Make sure the backend server is running on the expected port
        </p>
      </div>
    )
  }

  if (filteredProjects.length === 0 && searchQuery.trim()) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
        <Github className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-4">
          No projects match your search for "{searchQuery}"
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Clear Search
        </Button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
        <Github className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
        <p className="text-muted-foreground mb-4">Get started by creating your first project from a GitHub repository</p>
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
    <div className="space-y-4">
      {searchQuery.trim() && (
        <p className="text-sm text-muted-foreground">
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
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
    </div>
  )
}

// If you have dynamic imports, ensure they're correct
// Example of proper dynamic import:
// const DynamicComponent = dynamic(() => import('./SomeComponent'), {
//   loading: () => <p>Loading...</p>
// })

