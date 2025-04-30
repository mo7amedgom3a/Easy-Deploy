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
import { useRouter } from "next/navigation"
import { useState } from "react" // Import useState

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false) // Add state for disabling button

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    setIsLoggingOut(true)
    console.log("Sidebar logout initiated") // Add log

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token") || ""

      // Call the Next.js API route and WAIT
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Sidebar logout API response:", data.message)
      } else {
        console.error("Sidebar logout API error:", response.status, response.statusText)
      }

      // Always remove token and redirect, even if API fails
      localStorage.removeItem("token")
      console.log("Sidebar token removed")
      router.push("/")
      router.refresh() // Refresh to ensure state is cleared
      console.log("Sidebar redirected to home")

    } catch (error) {
      console.error("Sidebar logout error:", error)
      // Still clear local storage and redirect even if the API call fails
      localStorage.removeItem("token")
      router.push("/")
    } finally {
      setIsLoggingOut(false) // Re-enable button
    }
  }

  return (
    <Sidebar variant={isMobile ? "default" : "floating"} collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <Rocket className="h-6 w-6" />
          <span className="font-bold text-xl">Easy Deploy</span>
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
            {/* Update the button to use the refined handler and disable state */}
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout" disabled={isLoggingOut}>
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
