"use client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react" 
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/constants"

export function LogoutButton() {
  const router = useRouter()
  
  const handleLogout = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem("token")
      
      // Call the logout API
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Remove the token from localStorage regardless of API response
      localStorage.removeItem("token")
      
      // Redirect to the home page
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear local storage and redirect even if the API call fails
      localStorage.removeItem("token")
      router.push("/")
    }
  }
  
  return (
    <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}