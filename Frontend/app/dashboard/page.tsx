import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { DeploymentStats } from "@/components/dashboard/deployment-stats"
import { ProjectList } from "@/components/dashboard/project-list"
import { RecentDeployments } from "@/components/dashboard/recent-deployments"
import { ResourceUsage } from "@/components/dashboard/resource-usage"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4" /> New Project
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">

        <TabsContent value="overview" className="space-y-6">
          <DeploymentStats />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-5">
              <CardHeader>
                <CardTitle>Recent Deployments</CardTitle>
                <CardDescription>Your deployment activity across all projects</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentDeployments />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>Recent activity in your account</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>Manage and deploy your connected repositories</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectList />
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
                <CardDescription>Monitor your resource consumption</CardDescription>
              </CardHeader>
              <CardContent>
                <ResourceUsage />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

