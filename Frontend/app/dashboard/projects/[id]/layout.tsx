import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { ArrowUpRight, Github, Globe, MoreHorizontal, Rocket, Settings } from "lucide-react"

// This would come from your database in a real app
const getProject = (id: string) => {
  const projects = [
    {
      id: "1",
      name: "E-commerce Frontend",
      status: "active",
      domain: "ecommerce-frontend.deploywave.app",
      repository: "acme/ecommerce-frontend",
    },
    {
      id: "2",
      name: "API Backend",
      status: "active",
      domain: "api-backend.deploywave.app",
      repository: "acme/api-backend",
    },
  ]

  return projects.find((project) => project.id === id)
}

export default function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { id: string }
}) {
  const project = getProject(params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/projects">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{project.name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Github className="h-3.5 w-3.5" />
                <span>{project.repository}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" asChild>
              <Link href={`https://${project.domain}`} target="_blank">
                <Globe className="h-3.5 w-3.5" />
                <span>{project.domain}</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5">
              <Rocket className="h-3.5 w-3.5" />
              <span>Deploy</span>
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-auto border-b">
          <Tabs defaultValue="project" className="w-max">
            <TabsList className="bg-transparent p-0 h-auto">
              <Link href={`/dashboard/projects/${params.id}`} className="w-full">
                <TabsTrigger
                  value="project"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Project
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/deployments`} className="w-full">
                <TabsTrigger
                  value="deployments"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Deployments
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/analytics`} className="w-full">
                <TabsTrigger
                  value="analytics"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Analytics
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/speed-insights`} className="w-full">
                <TabsTrigger
                  value="speed-insights"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Speed Insights
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/logs`} className="w-full">
                <TabsTrigger
                  value="logs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Logs
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/observability`} className="w-full">
                <TabsTrigger
                  value="observability"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Observability
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/firewall`} className="w-full">
                <TabsTrigger
                  value="firewall"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Firewall
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/storage`} className="w-full">
                <TabsTrigger
                  value="storage"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Storage
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/flags`} className="w-full">
                <TabsTrigger
                  value="flags"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Flags
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/ai`} className="w-full">
                <TabsTrigger
                  value="ai"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  AI
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/auto-scaling`} className="w-full">
                <TabsTrigger
                  value="auto-scaling"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Auto Scaling
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/auto-healing`} className="w-full">
                <TabsTrigger
                  value="auto-healing"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  Auto Healing
                </TabsTrigger>
              </Link>
              <Link href={`/dashboard/projects/${params.id}/settings`} className="w-full">
                <TabsTrigger
                  value="settings"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-2.5"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </TabsTrigger>
              </Link>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div>{children}</div>
    </div>
  )
}
