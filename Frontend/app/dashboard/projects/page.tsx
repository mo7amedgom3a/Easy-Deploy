import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectGrid } from "@/components/dashboard/project-grid"
import { ProjectTable } from "@/components/dashboard/project-table"
import { Filter, Plus, Search } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Projects</CardTitle>
          <CardDescription>View and manage all your connected repositories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search projects..." className="w-full pl-8" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>

          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="grid" className="mt-4">
              <ProjectGrid />
            </TabsContent>
            <TabsContent value="list" className="mt-4">
              <ProjectTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

