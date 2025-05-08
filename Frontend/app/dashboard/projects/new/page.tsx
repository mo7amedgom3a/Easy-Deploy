"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Github, FileCode, Cog, Terminal, FileJson, Loader2, AlertCircle } from "lucide-react"
import { githubService } from "@/lib/services/github"
import { projectsService } from "@/lib/services/projects"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [repositories, setRepositories] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [branches, setBranches] = useState<string[]>(["main", "develop", "master"])
  const [githubUser, setGithubUser] = useState<any>(null)
  const [authError, setAuthError] = useState<string>("")
  const [repoLoading, setRepoLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repository: "",
    branch: "main",
    rootDirectory: "/",
    framework: "",
    useDocker: false,
    installCommand: "npm install",
    buildCommand: "npm run build",
    startCommand: "npm start",
    dockerfilePath: "./Dockerfile",
    dockerRunCommand: "",
    environmentVariables: "",
    encryptVars: false,
    nodeVersion: "18",
    autoDeploy: true,
    previewDeploys: true,
    buildCache: "enable",
    outputDirectory: "",
    customDomain: ""
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle switch changes
  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  // Handle repository selection
  const handleRepoChange = async (repoFullName: string) => {
    setSelectedRepo(repoFullName)
    setFormData(prev => ({
      ...prev,
      repository: repoFullName,
      name: repoFullName.split('/')[1] || prev.name // Use repo name as project name if available
    }))
    
    // Get selected repository info to potentially get real branches
    const selectedRepository = repositories.find(repo => repo.full_name === repoFullName)
    if (selectedRepository) {
      setFormData(prev => ({
        ...prev,
        description: selectedRepository.description || prev.description
      }))

      // Attempt to get branches for the selected repository
      try {
        setRepoLoading(true)
        const owner = repoFullName.split('/')[0];
        const repo = repoFullName.split('/')[1];
        
        if (owner && repo && selectedRepository.default_branch) {
          // Add default branch to the branches list if not already included
          if (!branches.includes(selectedRepository.default_branch)) {
            setBranches(prev => [...prev, selectedRepository.default_branch])
            // Set as selected branch
            setFormData(prev => ({
              ...prev,
              branch: selectedRepository.default_branch
            }))
          }
        }
      } catch (error) {
        console.error("Error fetching repository details:", error);
      } finally {
        setRepoLoading(false)
      }
    }
  }

  // Attempt to refresh GitHub auth and data
  const refreshGitHubData = async () => {
    setAuthError("");
    await fetchGitHubData();
  }

  // Fetch GitHub user and repositories
  const fetchGitHubData = async () => {
    setIsLoading(true)
    try {
      // First test authentication
      const isAuthenticated = await githubService.checkAuthStatus();
      
      if (!isAuthenticated) {
        setAuthError("GitHub authentication issue. Please ensure you are logged in with GitHub.");
        setIsLoading(false)
        return;
      }
      
      const user = await githubService.getCurrentUser()
      setGithubUser(user)
      
      if (user?.login) {
        const repos = await githubService.getRepositories(user.login)
        
        if (Array.isArray(repos) && repos.length > 0) {
          setRepositories(repos)
          setAuthError("")
        } else if (repos.error) {
          setAuthError(`Error: ${repos.error}`)
        } else {
          setAuthError("No repositories found. Please ensure your GitHub account has repositories.")
        }
      } else {
        setAuthError("Could not retrieve GitHub user information. Please try logging in again.")
      }
    } catch (error) {
      console.error("Error fetching GitHub data:", error)
      setAuthError("Failed to fetch GitHub data. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to fetch GitHub repositories. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial data load
  useEffect(() => {
    fetchGitHubData()
  }, [])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        repository: formData.repository,
        branch: formData.branch,
        rootDirectory: formData.rootDirectory,
        framework: formData.framework,
        buildCommand: formData.buildCommand,
        outputDirectory: formData.outputDirectory || "dist",
        environment: "development",
        nodeVersion: formData.nodeVersion,
        installCommand: formData.installCommand,
        autoDeploy: formData.autoDeploy,
      }
      
      const result = await projectsService.createProject(projectData)
      
      toast({
        title: "Success!",
        description: "Project created successfully",
      })
      
      // Redirect to project page
      router.push(`/dashboard/projects/${result.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

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

      {authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between">
            <span>{authError}</span>
            <Button size="sm" variant="outline" onClick={refreshGitHubData} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Github className="h-4 w-4 mr-2" />}
              Reconnect GitHub
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                <Input id="name" placeholder="My Awesome Project" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of your project"
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="repository">GitHub Repository</Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleRepoChange}>
                    <SelectTrigger className="w-[260px]">
                      <SelectValue placeholder={isLoading ? "Loading repositories..." : "Select Repository"} />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.length === 0 && !isLoading && (
                        <SelectItem value="none" disabled>No repositories found</SelectItem>
                      )}
                      {repositories.map(repo => (
                        <SelectItem key={repo.id} value={repo.full_name}>
                          {repo.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    id="repository" 
                    placeholder="username/repository-name" 
                    className="flex-1" 
                    value={formData.repository} 
                    onChange={handleInputChange} 
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a repository or enter the full repository name, e.g. "username/repository-name"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch to deploy</Label>
                <Select onValueChange={(value) => handleSelectChange("branch", value)} defaultValue={formData.branch}>
                  <SelectTrigger id="branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rootDirectory">Root Directory</Label>
                <Input id="rootDirectory" placeholder="/" value={formData.rootDirectory} onChange={handleInputChange} />
                <p className="text-sm text-muted-foreground mt-1">
                  Leave empty to use the repository root, or specify a subdirectory (e.g., "frontend")
                </p>
              </div>
            </TabsContent>

            <TabsContent value="build" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Select onValueChange={(value) => handleSelectChange("framework", value)}>
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
                <Switch id="useDocker" checked={formData.useDocker} onCheckedChange={(checked) => handleSwitchChange("useDocker", checked)} />
                <Label htmlFor="useDocker">Use Dockerfile</Label>
              </div>

              <div className="space-y-6">
                <div className="border rounded-md p-4">
                  <div className="flex items-center mb-4">
                    <Terminal className="h-5 w-5 mr-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">Build & Run Commands</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="installCommand">Install Command</Label>
                      <Input id="installCommand" placeholder="npm install" value={formData.installCommand} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buildCommand">Build Command</Label>
                      <Input id="buildCommand" placeholder="npm run build" value={formData.buildCommand} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startCommand">Start Command</Label>
                      <Input id="startCommand" placeholder="npm start" value={formData.startCommand} onChange={handleInputChange} />
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
                      <Label htmlFor="dockerfilePath">Dockerfile Path</Label>
                      <Input id="dockerfilePath" placeholder="./Dockerfile" value={formData.dockerfilePath} onChange={handleInputChange} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dockerRunCommand">Docker Run Command (optional)</Label>
                      <Input id="dockerRunCommand" placeholder="docker run -p 3000:3000 my-image" value={formData.dockerRunCommand} onChange={handleInputChange} />
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
                    <Label htmlFor="environmentVariables">Environment Variables</Label>
                    <Textarea
                      id="environmentVariables"
                      placeholder="DATABASE_URL=postgres://user:password@localhost:5432/db
API_KEY=your_api_key
NODE_ENV=production"
                      className="font-mono text-sm min-h-[200px]"
                      value={formData.environmentVariables}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Enter environment variables in KEY=VALUE format, one per line
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="encryptVars" checked={formData.encryptVars} onCheckedChange={(checked) => handleSwitchChange("encryptVars", checked)} />
                    <Label htmlFor="encryptVars">Encrypt sensitive variables</Label>
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
                    <Label htmlFor="nodeVersion">Node.js Version</Label>
                    <Select onValueChange={(value) => handleSelectChange("nodeVersion", value)}>
                      <SelectTrigger id="nodeVersion">
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
                    <Label htmlFor="envFile">Upload .env File (Optional)</Label>
                    <Input id="envFile" type="file" className="cursor-pointer" />
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
                    <Switch id="autoDeploy" checked={formData.autoDeploy} onCheckedChange={(checked) => handleSwitchChange("autoDeploy", checked)} />
                    <Label htmlFor="autoDeploy">Auto-deploy on push</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="previewDeploys" checked={formData.previewDeploys} onCheckedChange={(checked) => handleSwitchChange("previewDeploys", checked)} />
                    <Label htmlFor="previewDeploys">Create preview deployments for pull requests</Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildCache">Build Cache</Label>
                    <Select defaultValue={formData.buildCache} onValueChange={(value) => handleSelectChange("buildCache", value)}>
                      <SelectTrigger id="buildCache">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enable">Enable build cache</SelectItem>
                        <SelectItem value="disable">Disable build cache</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outputDirectory">Output Directory</Label>
                    <Input id="outputDirectory" placeholder="dist" value={formData.outputDirectory} onChange={handleInputChange} />
                    <p className="text-sm text-muted-foreground mt-1">
                      The directory where your build outputs static files
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                    <Input id="customDomain" placeholder="www.example.com" value={formData.customDomain} onChange={handleInputChange} />
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
          <Button className="gap-2" onClick={handleSubmit} disabled={isLoading || authError !== ""}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Github className="h-4 w-4" />
            Create Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
