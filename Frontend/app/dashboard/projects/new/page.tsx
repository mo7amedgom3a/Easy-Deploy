import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Github, FileCode, Cog, Terminal, FileJson } from "lucide-react"

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Enter the details for your new project</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="build">Build Settings</TabsTrigger>
              <TabsTrigger value="env">Environment</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" placeholder="My Awesome Project" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project"
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repository">GitHub Repository</Label>
                <div className="flex gap-2">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="acme-corp">Acme Corp</SelectItem>
                      <SelectItem value="startup-inc">Startup Inc</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input id="repository" placeholder="username/repository-name" className="flex-1" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the full repository name, e.g. "username/repository-name"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch to deploy</Label>
                <Select>
                  <SelectTrigger id="branch">
                    <SelectValue placeholder="Select a branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="develop">develop</SelectItem>
                    <SelectItem value="staging">staging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="root-dir">Root Directory</Label>
                <Input id="root-dir" placeholder="/" />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave empty to use the repository root, or specify a subdirectory (e.g., "frontend")
                </p>
              </div>
            </TabsContent>

            <TabsContent value="build" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Select>
                  <SelectTrigger id="framework">
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nextjs">Next.js</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="angular">Angular</SelectItem>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Switch id="use-docker" />
                <Label htmlFor="use-docker">Use Dockerfile</Label>
              </div>

              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-4">
                    <Terminal className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Build & Run Commands</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="install-cmd">Install Command</Label>
                      <Input id="install-cmd" placeholder="npm install" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="build-cmd">Build Command</Label>
                      <Input id="build-cmd" placeholder="npm run build" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start-cmd">Start Command</Label>
                      <Input id="start-cmd" placeholder="npm start" />
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-4">
                    <FileCode className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Docker Configuration</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="dockerfile-path">Dockerfile Path</Label>
                      <Input id="dockerfile-path" placeholder="./Dockerfile" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="docker-cmd">Docker Run Command (optional)</Label>
                      <Input id="docker-cmd" placeholder="docker run -p 3000:3000 my-image" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="env" className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="flex items-center mb-4">
                  <FileJson className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Environment Variables</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="env-vars">Environment Variables</Label>
                    <Textarea
                      id="env-vars"
                      placeholder="DATABASE_URL=postgres://user:password@localhost:5432/db
API_KEY=your_api_key
NODE_ENV=production"
                      className="font-mono text-sm min-h-[200px]"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter environment variables in KEY=VALUE format, one per line
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="encrypt-vars" />
                    <Label htmlFor="encrypt-vars">Encrypt sensitive variables</Label>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <div className="flex items-center mb-4">
                  <Cog className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Environment Configuration</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="node-version">Node.js Version</Label>
                    <Select>
                      <SelectTrigger id="node-version">
                        <SelectValue placeholder="Select Node.js version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">20.x (Latest)</SelectItem>
                        <SelectItem value="18">18.x (LTS)</SelectItem>
                        <SelectItem value="16">16.x</SelectItem>
                        <SelectItem value="14">14.x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="env-file">Upload .env File (Optional)</Label>
                    <Input id="env-file" type="file" className="cursor-pointer" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="border rounded-md p-4">
                <div className="flex items-center mb-4">
                  <Cog className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Advanced Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-deploy" defaultChecked />
                    <Label htmlFor="auto-deploy">Auto-deploy on push</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="preview-deploys" defaultChecked />
                    <Label htmlFor="preview-deploys">Create preview deployments for pull requests</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="build-cache">Build Cache</Label>
                    <Select defaultValue="enable">
                      <SelectTrigger id="build-cache">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enable">Enable build cache</SelectItem>
                        <SelectItem value="disable">Disable build cache</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="output-dir">Output Directory</Label>
                    <Input id="output-dir" placeholder="dist" />
                    <p className="text-sm text-muted-foreground mt-1">
                      The directory where your build outputs static files
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                    <Input id="custom-domain" placeholder="www.example.com" />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/projects">Cancel</Link>
          </Button>
          <Button className="gap-2">
            <Github className="h-4 w-4" />
            Create Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
