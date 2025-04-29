"use client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react" 
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/constants"
import { useState } from "react"

export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  const handleLogout = async () => {
    if (isLoggingOut) return // Prevent multiple clicks
    
    setIsLoggingOut(true)
    
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token") || ""
      
      // Call the logout API
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Remove the token from localStorage
      localStorage.removeItem("token")
      
      // Redirect to the home page
      router.push("/")
      router.refresh() // Force refresh to update UI state
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear local storage and redirect even if the API call fails
      localStorage.removeItem("token")
      router.push("/")
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