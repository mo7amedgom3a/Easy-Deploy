"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Save, Trash2 } from "lucide-react"

export default function SettingsPage({ params }: { params: { id: string } }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  // This would come from your API in a real app
  const project = {
    id: params.id,
    name: "E-commerce Frontend",
    framework: "Next.js",
    nodeVersion: "18.x",
    buildCommand: "npm run build",
    outputDirectory: ".next",
    rootDirectory: "/",
    installCommand: "npm install",
    domain: "ecommerce-frontend.deploywave.app",
    repository: "acme/ecommerce-frontend",
    branch: "main",
    autoScaling: true,
    autoHealing: true,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Project Settings</h2>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Save className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="general" className="flex-1 sm:flex-none">General</TabsTrigger>
          <TabsTrigger value="build" className="flex-1 sm:flex-none">Build & Development</TabsTrigger>
          <TabsTrigger value="domains" className="flex-1 sm:flex-none">Domains</TabsTrigger>
          <TabsTrigger value="environment" className="flex-1 sm:flex-none">Environment Variables</TabsTrigger>
          <TabsTrigger value="integrations" className="flex-1 sm:flex-none">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic project configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input id="project-name" defaultValue={project.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="repository">GitHub Repository</Label>
                <div className="flex items-center gap-2 border rounded-md p-3">
                  <Code className="h-4 w-4 text-primary" />
                  <span>{project.repository}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="branch">Production Branch</Label>
                <Select defaultValue={project.branch}>
                  <SelectTrigger id="branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">main</SelectItem>
                    <SelectItem value="master">master</SelectItem>
                    <SelectItem value="production">production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-deploy" defaultChecked />
                <Label htmlFor="auto-deploy">Auto-deploy on push</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="preview-deploys" defaultChecked />
                <Label htmlFor="preview-deploys">Create preview deployments for pull requests</Label>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border border-destructive/20 rounded-md p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-destructive">Delete Project</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Permanently delete this project and all of its deployments. This action cannot be undone.
                    </p>
                  </div>
                  {!confirmDelete ? (
                    <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
                      Delete Project
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => setConfirmDelete(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" className="gap-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Confirm Delete</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="build" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Build & Development Settings</CardTitle>
              <CardDescription>Configure how your project is built and deployed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="framework">Framework Preset</Label>
                <Select defaultValue={project.framework}>
                  <SelectTrigger id="framework">
                    <SelectValue />
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
              
              <div className="space-y-2">
                <Label htmlFor="node-version">Node.js Version</Label>
                <Select defaultValue={project.nodeVersion}>
                  <SelectTrigger id="node-version">
                    <SelectValue />
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
                <Label htmlFor="root-dir">Root Directory</Label>
                <Input id="root-dir" defaultValue={project.rootDirectory} />
                <p className="text-sm text-muted-foreground mt-1">
                  The directory where your source code is located. Leave empty to use the repository root.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="build-cmd">Build Command</Label>
                <Input id="build-cmd" defaultValue={project.buildCommand} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="install-cmd">Install Command</Label>
                <Input id="install-cmd" defaultValue={project.installCommand} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="output-dir">Output Directory</Label>
                <Input id="output-dir" defaultValue={project.outputDirectory} />
                <p className="text-sm text-muted-foreground mt-1">
                  The directory where your built application is located.
                </p>
              </div>\
