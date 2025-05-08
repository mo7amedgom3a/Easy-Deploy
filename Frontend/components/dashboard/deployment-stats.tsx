"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle, Github } from "lucide-react"
import { DeploymentStats as DeploymentStatsType, deploymentsService } from "@/lib/services"

export function DeploymentStats() {
  const [stats, setStats] = useState<DeploymentStatsType>({
    total: 0,
    successful: 0,
    failed: 0,
    inProgress: 0,
    successRate: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await deploymentsService.getDeploymentStats();
        
        // Check if we got valid stats or just GitHub commits (in which case all are "successful")
        if (data.total > 0 && data.successful === data.total && data.failed === 0) {
          // If all are successful, likely these are GitHub commits, not real deployments
          setStats({
            ...data,
            // Add a note to the stats object that this is GitHub activity
            isGitHubActivity: true
          } as DeploymentStatsType);
        } else {
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching deployment stats:", error);
        setError("Failed to load deployment statistics");
        setStats({
          total: 0,
          successful: 0,
          failed: 0,
          inProgress: 0,
          successRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {(stats as any).isGitHubActivity ? 'GitHub Activities' : 'Total Deployments'}
          </CardTitle>
          {(stats as any).isGitHubActivity ? (
            <Github className="h-4 w-4 text-muted-foreground" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M2 12h20" />
            </svg>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : error ? (
            <div className="text-sm text-muted-foreground">No data available</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {(stats as any).isGitHubActivity ? 'Recent commits' : 'All deployments'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {(stats as any).isGitHubActivity ? 'GitHub Commits' : 'Successful Deployments'}
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : error ? (
            <div className="text-sm text-muted-foreground">No data available</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.successful}</div>
              <p className="text-xs text-muted-foreground">
                {(stats as any).isGitHubActivity 
                  ? 'From repositories' 
                  : `${stats.successRate}% success rate`}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {(stats as any).isGitHubActivity ? 'Deployment Failures' : 'Failed Deployments'}
          </CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : error ? (
            <div className="text-sm text-muted-foreground">No data available</div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">
                {(stats as any).isGitHubActivity 
                  ? 'No failures detected' 
                  : `${Math.round((stats.failed / (stats.total || 1)) * 100)}% failure rate`}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {(stats as any).isGitHubActivity ? 'Ready to Deploy' : 'In Progress'}
          </CardTitle>
          {(stats as any).isGitHubActivity ? (
            <Github className="h-4 w-4 text-blue-500" />
          ) : (
            <Clock className="h-4 w-4 text-orange-500" />
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : error ? (
            <div className="text-sm text-muted-foreground">No data available</div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {(stats as any).isGitHubActivity ? stats.total : stats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">
                {(stats as any).isGitHubActivity ? 'Commits to deploy' : 'Deploying now'}
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Add informational message when showing GitHub activity instead of real deployments */}
      {!isLoading && !error && (stats as any).isGitHubActivity && (
        <div className="col-span-full mt-2 text-center text-sm text-muted-foreground">
          <Github className="inline-block h-4 w-4 mr-1 mb-1" /> 
          Showing GitHub activity. Deploy your projects to see actual deployment statistics.
        </div>
      )}
    </div>
  )
}

