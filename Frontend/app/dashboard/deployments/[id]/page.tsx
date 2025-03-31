import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Github, RotateCcw, Terminal, XCircle } from "lucide-react"

export default function DeploymentDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch deployment details based on the ID
  const deployment = {
    id: params.id,
    project: "E-commerce Frontend",
    status: "success",
    branch: "main",
    commit: "a1b2c3d4e5f6g7h8i9j0",
    commitMessage: "Update product listing component and fix cart bug",
    author: "John Doe",
    time: "2 hours ago",
    duration: "1m 45s",
    url: "https://ecommerce-frontend-a1b2c3.deploywave.app",
    logs: [
      { time: "12:01:23", message: "Build started" },
      { time: "12:01:25", message: "Installing dependencies" },
      { time: "12:01:45", message: "Dependencies installed successfully" },
      { time: "12:01:47", message: "Running build command: npm run build" },
      { time: "12:03:02", message: "Build completed successfully" },
      { time: "12:03:05", message: "Deploying to production" },
      { time: "12:03:08", message: "Deployment successful" },
    ],
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/deployments">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Deployment Details
            {deployment.status === "success" && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {deployment.status === "failed" && <XCircle className="h-6 w-6 text-destructive" />}
            {deployment.status === "building" && <Clock className="h-6 w-6 text-orange-500 animate-spin" />}
          </h1>
          <p className="text-muted-foreground">
            {deployment.project} • {deployment.time}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Deployment Information</CardTitle>
            <CardDescription>Details about this deployment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {deployment.status === "success" && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                          Success
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="mt-1">{deployment.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Branch</p>
                  <p className="mt-1">{deployment.branch}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commit</p>
                  <p className="mt-1 font-mono text-xs">{deployment.commit.substring(0, 7)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Author</p>
                  <p className="mt-1">{deployment.author}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Deployed URL</p>
                  <div className="flex items-center gap-2 mt-1">
                    <a href="#" className="text-primary hover:underline flex items-center gap-1">
                      {deployment.url.split("//")[1]}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Commit Message</p>
                <p className="mt-1">{deployment.commitMessage}</p>
              </div>

              <div className="flex gap-2 mt-6">
                <Button asChild>
                  <Link href={`/dashboard/deployments/${deployment.id}/redeploy`}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Redeploy
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Site
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`https://github.com/username/repo/commit/${deployment.commit}`} target="_blank">
                    <Github className="mr-2 h-4 w-4" />
                    View Commit
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Build Information</CardTitle>
            <CardDescription>Build and deployment details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Framework</p>
                <p className="mt-1">Next.js</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Node Version</p>
                <p className="mt-1">18.x</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Build Command</p>
                <p className="mt-1 font-mono text-xs">npm run build</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Output Directory</p>
                <p className="mt-1 font-mono text-xs">.next</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Environment</p>
                <p className="mt-1">Production</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deployment Logs</CardTitle>
          <CardDescription>Build and deployment process logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="logs">
            <TabsList>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="functions">Functions</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
            </TabsList>
            <TabsContent value="logs" className="mt-4">
              <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-auto max-h-[400px]">
                <div className="flex items-start gap-2">
                  <Terminal className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="space-y-2">
                    {deployment.logs.map((log, index) => (
                      <div key={index}>
                        <span className="text-muted-foreground">[{log.time}]</span> {log.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="functions" className="mt-4">
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Serverless functions information</p>
              </div>
            </TabsContent>
            <TabsContent value="env" className="mt-4">
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Environment variables (redacted)</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

