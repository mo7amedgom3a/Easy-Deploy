"use client"

import { useSidebar } from "@/components/ui/sidebar"
import { Menu } from "lucide-react"

export function Navbar() {
  const { toggle } = useSidebar()

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <button onClick={toggle} className="p-2 hover:bg-muted rounded-md">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Deployment Dashboard</h1>
          
        </div>
      </div>
    </header>
  )
} 