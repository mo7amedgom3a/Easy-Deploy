import type { ReactNode } from "react"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider defaultOpen={true}>
        <div className="flex flex-col  lg:p-6">
          <DashboardSidebar />
          <SidebarInset className="flex flex-col flex-1 overflow-hidden min-h-0">
            <DashboardHeader />
            <main className="flex-1 p-6 space-y-4">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  )
}

