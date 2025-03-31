"use client"
import { usePathname } from "next/navigation"
import {
  BarChart,
  CreditCard,
  FileText,
  Github,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Rocket,
  Settings,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isMobile } = useSidebar()

  return (
    <Sidebar variant={isMobile ? "default" : "floating"} collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Rocket className="h-6 w-6" />
          <span className="font-bold text-xl">DeployWave</span>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard"}
              onClick={() => (window.location.href = "/dashboard")}
              tooltip="Dashboard"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/projects"}
              onClick={() => (window.location.href = "/dashboard/projects")}
              tooltip="Projects"
            >
              <Github className="h-4 w-4" />
              <span>Projects</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/deployments"}
              onClick={() => (window.location.href = "/dashboard/deployments")}
              tooltip="Deployments"
            >
              <Rocket className="h-4 w-4" />
              <span>Deployments</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => (window.location.href = "/dashboard/analytics")} tooltip="Analytics">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => (window.location.href = "/dashboard/logs")} tooltip="Logs">
              <FileText className="h-4 w-4" />
              <span>Logs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => (window.location.href = "/dashboard/team")} tooltip="Team">
              <Users className="h-4 w-4" />
              <span>Team</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => (window.location.href = "/dashboard/billing")} tooltip="Billing">
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname === "/dashboard/settings"}
              onClick={() => (window.location.href = "/dashboard/settings")}
              tooltip="Settings"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => (window.location.href = "/dashboard/help")} tooltip="Help & Support">
              <LifeBuoy className="h-4 w-4" />
              <span>Help & Support</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => (window.location.href = "/dashboard/documentation")}
              tooltip="Documentation"
            >
              <FileText className="h-4 w-4" />
              <span>Documentation</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => (window.location.href = "/logout")} tooltip="Log out">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

