import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Code,
  ExternalLink,
  FileCode,
  Github,
  GitBranch,
  GitCommit,
  Globe,
  LayoutDashboard,
  RefreshCw,
  Rocket,
  Server,
  Terminal,
  XCircle,
  MoreHorizontal,
} from "lucide-react"

export default function ProjectPage({ params }: { params: { id: string } }) {
  // This would come from your API in a real app
  const project = {
    id: params.id,
    name: "E-commerce Frontend",
    status: "active",
    domain: "ecommerce-frontend.deploywave.app",
    repository: "acme/ecommerce-frontend",
    framework: "Next.js",
    nodeVersion: "18.x",
    lastDeployment: {
      id: "dep_123",
      status: "success",
      branch: "main",
      commit: "a1b2c3d4e5f6g7h8i9j0",
      commitMessage: "Update product listing component and fix cart bug",
      author: "John Doe",
      timestamp: "2 hours ago",
      duration: "1m 45s",
    },
    environment: "Production",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    rootDirectory: "/",
    installCommand: "npm install",
    autoScaling: true,
    autoHealing: true,
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Latest Deployment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {project.lastDeployment.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {project.lastDeployment.status === "failed" && <XCircle className="h-5 w-5 text-destructive" />}
              {project.lastDeployment.status === "building" && (
                <Clock className="h-5 w-5 text-orange-500 animate-spin" />
              )}
              <span className="font-medium">
                {project.lastDeployment.status === "success" && "Deployed successfully"}
                {project.lastDeployment.status === "failed" && "Deployment failed"}
                {project.lastDeployment.status === "building" && "Building..."}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              {project.lastDeployment.timestamp} • {project.lastDeployment.duration}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href="#" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Visit</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Redeploy</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Repository</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Github className="h-5 w-5" />
              <span className="font-medium">{project.repository}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <GitBranch className="h-3.5 w-3.5" />
              <span>{project.lastDeployment.branch}</span>
              <GitCommit className="h-3.5 w-3.5 ml-2" />
              <span className="font-mono">{project.lastDeployment.commit.substring(0, 7)}</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`https://github.com/${project.repository}`} target="_blank" rel="noreferrer">
                <Github className="h-3.5 w-3.5" />
                <span>View on GitHub</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">{project.domain}</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                Production
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <a href={`https://${project.domain}`} target="_blank" rel="noreferrer">
                <Globe className="h-3.5 w-3.5" />
                <span>Visit Site</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Recent Deployments</TabsTrigger>
          <TabsTrigger value="settings">Project Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
              <CardDescription>Key information about your project</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Framework</h3>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <span>{project.framework}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Environment</h3>
                  <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-primary" />
                    <span>{project.environment}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Node.js Version</h3>
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <span>{project.nodeVersion}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Build Command</h3>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-primary" />
                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{project.buildCommand}</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Output Directory</h3>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{project.outputDirectory}</code>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Root Directory</h3>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{project.rootDirectory}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Auto Scaling</CardTitle>
                <CardDescription>Automatic scaling configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-5 w-5 text-primary" />
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge variant={project.autoScaling ? "default" : "outline"}>
                    {project.autoScaling ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your project will automatically scale based on traffic and resource usage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auto Healing</CardTitle>
                <CardDescription>Automatic recovery configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-primary" />
                    <span className="font-medium">Status</span>
                  </div>
                  <Badge variant={project.autoHealing ? "default" : "outline"}>
                    {project.autoHealing ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Your project will automatically recover from failures and crashes.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployments">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deployments</CardTitle>
              <CardDescription>History of your project deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Branch</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Commit</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Author</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Success</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">main</td>
                        <td className="p-4 align-middle font-mono text-xs">a1b2c3d</td>
                        <td className="p-4 align-middle">John Doe</td>
                        <td className="p-4 align-middle">
                          {i + 1} hour{i !== 0 ? "s" : ""} ago
                        </td>
                        <td className="p-4 align-middle">1m 45s</td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Project Settings</CardTitle>
              <CardDescription>Configure your project settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Build & Development Settings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Framework Preset</label>
                    <div className="flex items-center gap-2 border rounded-md p-3">
                      <Code className="h-4 w-4 text-primary" />
                      <span>{project.framework}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Node.js Version</label>
                    <div className="flex items-center gap-2 border rounded-md p-3">
                      <Terminal className="h-4 w-4 text-primary" />
                      <span>{project.nodeVersion}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Build Command</label>
                    <div className="flex items-center gap-2 border rounded-md p-3">
                      <FileCode className="h-4 w-4 text-primary" />
                      <code className="text-sm">{project.buildCommand}</code>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Install Command</label>
                    <div className="flex items-center gap-2 border rounded-md p-3">
                      <FileCode className="h-4 w-4 text-primary" />
                      <code className="text-sm">{project.installCommand}</code>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <div className="border rounded-md p-4">
                  <p className="text-sm text-muted-foreground">
                    Environment variables are encrypted and only exposed to your project during builds and at runtime.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Manage Environment Variables
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Danger Zone</h3>
                <div className="border border-destructive/20 rounded-md p-4">
                  <h4 className="font-medium text-destructive mb-2">Delete Project</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete this project and all of its deployments. This action cannot be undone.
                  </p>
                  <Button variant="destructive">Delete Project</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
