"use client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react" 
import { useState } from "react"
import { useAuth } from "@/lib/auth"

export function LogoutButton() {
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    
    setIsLoggingOut(true)
    
    try {
      // Use the centralized auth context to handle secure logout
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }
  
  return (
    <Button 
      variant="outline" 
      onClick={handleLogout} 
      className="flex items-center gap-2 w-full justify-start"
      disabled={isLoggingOut}
    >
      <LogOut className="h-4 w-4" />
      {isLoggingOut ? "Logging out..." : "Logout"}
    </Button>
  )
}