"use strict"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function GithubLoginButton() {
  const handleLogin = () => {
      window.location.href = "http://127.0.0.1:8000/auth/login"; // Change to your backend base URL
  }
  return (
    <Button className="w-full" type="button" onClick={handleLogin}>
      
      <Github className="mr-2 h-4 w-4" />
      Sign in with GitHub
    </Button>
  )
}

