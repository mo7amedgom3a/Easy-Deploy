import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export function GithubLoginButton() {
  return (
    <Button className="w-full" type="button">
      <Github className="mr-2 h-4 w-4" />
      Sign in with GitHub
    </Button>
  )
}

