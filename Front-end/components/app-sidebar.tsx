"use client"

import { useSidebar } from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function AppSidebar() {
  const { isOpen } = useSidebar()
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    
  ]

  return (
    <aside className={`bg-background border-r ${isOpen ? "w-64" : "w-16"} transition-all duration-300`}>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block p-2 rounded-md ${
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
} 