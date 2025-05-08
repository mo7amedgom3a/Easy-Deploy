"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, Clock, ExternalLink, Github, RotateCcw, XCircle } from "lucide-react"
import { Deployment, deploymentsService } from "@/lib/services"

export function RecentDeployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeployments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await deploymentsService.getRecentDeployments(5);
        setDeployments(data);
      } catch (error) {
        console.error("Error fetching recent deployments:", error);
        setError("Failed to load deployment data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  const handleRedeploy = async (deploymentId: string) => {
    try {
      // If it's a commit and not an actual deployment, show message
      if (deploymentId.startsWith('commit_')) {
        alert('This is a GitHub commit, not an actual deployment. Please use the Deploy button to create a new deployment.');
        return;
      }
      
      await deploymentsService.redeploy(deploymentId);
      // Refresh the list after redeploying
      const data = await deploymentsService.getRecentDeployments(5);
      setDeployments(data);
    } catch (error) {
      console.error(`Error redeploying deployment ${deploymentId}:`, error);
      alert('Failed to redeploy. Please try again later.');
    }
  };

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

  if (deployments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No deployment activity found</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Commit</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deployments.map((deployment) => (
            <TableRow key={deployment.id}>
              <TableCell className="font-medium">
                <Link href={`/dashboard/projects/${deployment.projectId}`} className="hover:underline">
                  {deployment.project}
                </Link>
              </TableCell>
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
                  {deployment.status === "canceled" && (
                    <>
                      <XCircle className="h-4 w-4 text-gray-500" />
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
                        Canceled
                      </Badge>
                    </>
                  )}
                  {deployment.status === "not_deployed" && (
                    <>
                      <Github className="h-4 w-4 text-blue-500" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        Commit
                      </Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>{deployment.branch || "main"}</TableCell>
              <TableCell className="font-mono text-xs">
                {deployment.commit ? deployment.commit.substring(0, 7) : "Unknown"}
              </TableCell>
              <TableCell>{deployment.time || deployment.timestamp || "Unknown"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {deployment.status === "not_deployed" ? (
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/projects/${deployment.projectId}/deploy`}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Deploy commit</span>
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="icon" className="h-8 w-8" asChild>
                      <Link href={`/dashboard/deployments/${deployment.id}`}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View deployment</span>
                      </Link>
                    </Button>
                  )}
                  {deployment.status !== "not_deployed" && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => handleRedeploy(deployment.id)}
                      disabled={deployment.status === "building"}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="sr-only">Redeploy</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {deployments.length > 0 && deployments.some(d => d.status === "not_deployed") && (
        <div className="mt-4 text-sm text-muted-foreground text-center">
          <p>
            <Github className="inline-block h-4 w-4 mr-1 align-text-bottom" />
            "Commit" status indicates GitHub activity not yet deployed
          </p>
        </div>
      )}
    </div>
  )
}

