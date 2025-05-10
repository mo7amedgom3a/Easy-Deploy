"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"
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
  X,
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
import { useState } from "react"
import { useAuth } from "@/lib/auth" // Import auth context
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar()
  const { logout } = useAuth() // Use auth context for logout
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    setIsLoggingOut(true)

    try {
      // Use the centralized auth context logout function
      await logout()
    } catch (error) {
      console.error("Sidebar logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Helper to check if a path is active
  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return pathname.startsWith(path) && path !== "/dashboard"
  }

  // Shared menu link component for consistent styling and behavior
  const MenuLink = ({ href, icon, label, badge, active }: { 
    href: string, 
    icon: React.ReactNode, 
    label: string, 
    badge?: React.ReactNode,
    active: boolean 
  }) => (
    <SidebarMenuItem>
      <Link 
        href={href} 
        passHref 
        className="w-full" 
        onClick={() => isMobile && setOpenMobile(false)}
      >
        <SidebarMenuButton 
          isActive={active} 
          tooltip={label}
          className={cn(
            "w-full justify-start",
            active && "font-medium"
          )}
        >
          {icon}
          <span>{label}</span>
          {badge}
        </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );
  
  const sidebarContent = (
    <>
      <SidebarHeader className="h-14 md:h-16 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold tracking-tight text-xl">Easy Deploy</span>
        </div>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setOpenMobile(false)} className="md:hidden">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarMenu>
          <MenuLink 
            href="/dashboard" 
            icon={<LayoutDashboard className="h-4 w-4" />} 
            label="Dashboard" 
            active={pathname === "/dashboard"} 
          />
          
          <MenuLink 
            href="/dashboard/projects" 
            icon={<Github className="h-4 w-4" />} 
            label="Projects" 
            active={isActive("/dashboard/projects")} 
            badge={(open || isMobile) && <Badge variant="outline" className="ml-auto text-xs">New</Badge>}
          />
          
          <MenuLink 
            href="/dashboard/deployments" 
            icon={<Rocket className="h-4 w-4" />} 
            label="Deployments" 
            active={isActive("/dashboard/deployments")} 
          />
          
          <MenuLink 
            href="/dashboard/analytics" 
            icon={<BarChart className="h-4 w-4" />} 
            label="Analytics" 
            active={isActive("/dashboard/analytics")} 
          />
          
          <MenuLink 
            href="/dashboard/logs" 
            icon={<FileText className="h-4 w-4" />} 
            label="Logs" 
            active={isActive("/dashboard/logs")} 
          />
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        <SidebarMenu>
          <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">Management</h3>
          
          <MenuLink 
            href="/dashboard/team" 
            icon={<Users className="h-4 w-4" />} 
            label="Team" 
            active={isActive("/dashboard/team")} 
          />
          
          <MenuLink 
            href="/dashboard/billing" 
            icon={<CreditCard className="h-4 w-4" />} 
            label="Billing" 
            active={isActive("/dashboard/billing")} 
          />
          
          <MenuLink 
            href="/dashboard/settings" 
            icon={<Settings className="h-4 w-4" />} 
            label="Settings" 
            active={isActive("/dashboard/settings")} 
          />
        </SidebarMenu>

        <SidebarSeparator className="my-2" />

        <SidebarMenu>
          <h3 className="mb-2 px-2 text-xs font-medium text-muted-foreground">Support</h3>
          
          <MenuLink 
            href="/dashboard/help" 
            icon={<LifeBuoy className="h-4 w-4" />} 
            label="Help & Support" 
            active={isActive("/dashboard/help")} 
          />
          
          <MenuLink 
            href="/dashboard/documentation" 
            icon={<FileText className="h-4 w-4" />} 
            label="Documentation" 
            active={isActive("/dashboard/documentation")} 
          />
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="mt-auto px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout} 
              tooltip="Logout" 
              disabled={isLoggingOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile sidebar overlay */}
        {openMobile && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setOpenMobile(false)}
            aria-hidden="true"
          />
        )}
      
        {/* Mobile sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[280px] border-r bg-background transition-transform duration-300 ease-in-out md:hidden",
            openMobile ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <Sidebar 
      variant="floating" 
      collapsible="icon" 
      className="border-border/40 z-50 hidden md:flex"
    >
      {sidebarContent}
    </Sidebar>
  );
}
