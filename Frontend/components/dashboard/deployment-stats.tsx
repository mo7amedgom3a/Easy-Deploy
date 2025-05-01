"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
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

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await deploymentsService.getDeploymentStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching deployment stats:", error);
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
          <CardTitle className="text-sm font-medium">Total Deployments</CardTitle>
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
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All deployments</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Successful Deployments</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.successful}</div>
              <p className="text-xs text-muted-foreground">{stats.successRate}% success rate</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Deployments</CardTitle>
          <XCircle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">{Math.round((stats.failed / (stats.total || 1)) * 100)}% failure rate</p>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse h-8 w-16 bg-muted rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Deploying now</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

