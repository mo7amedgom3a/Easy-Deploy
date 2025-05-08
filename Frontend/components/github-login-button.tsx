"use strict"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/lib/constants"

export function GithubLoginButton() {
  const handleLogin = () => {
      window.location.href = `${API_URL}/auth/login`; // Use API_URL from constants
  }
  return (
    <Button className="w-full" type="button" onClick={handleLogin}>
      
      <Github className="mr-2 h-4 w-4" />
      Sign in with GitHub
    </Button>
  )
}

