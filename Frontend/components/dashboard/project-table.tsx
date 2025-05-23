"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

interface ProjectTableProps {
  searchQuery?: string
}

export function ProjectTable({ searchQuery = "" }: ProjectTableProps) {
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

  const handleDeploy = async (project: Project) => {
    toast({
      title: "Deployment Started",
      description: `Starting deployment for ${project.name}`,
    })
    // TODO: Implement actual deployment logic
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
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Framework</TableHead>
              <TableHead>Last Deployed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-20 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  return (
    <div className="space-y-4">
      {searchQuery.trim() && (
        <p className="text-sm text-muted-foreground">
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </p>
      )}
      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Framework</TableHead>
              <TableHead>Last Deployed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
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
                  <div className="flex items-center gap-2">
                    {getStatusIcon(project.status)}
                    <span className="text-sm">{getStatusText(project.status)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {project.framework && (
                    <Badge variant="outline">
                      {project.framework}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {project.lastDeployed ? (
                    <span className="text-sm text-muted-foreground">
                      {new Date(project.lastDeployed).toLocaleDateString()}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      className="h-8 gap-1"
                      onClick={() => handleDeploy(project)}
                      disabled={project.status === "building"}
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      <span>{project.status === "building" ? "Building..." : "Deploy"}</span>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}`}>View Project</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/settings`}>Edit Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/projects/${project.id}/logs`}>View Logs</Link>
                        </DropdownMenuItem>
                        {project.repositoryUrl && (
                          <DropdownMenuItem asChild>
                            <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer">
                              View Repository
                            </a>
                          </DropdownMenuItem>
                        )}
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
    </div>
  )
}

