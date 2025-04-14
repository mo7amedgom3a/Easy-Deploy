"use client"
import Link from "next/link"
import { Rocket } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GithubLoginButton } from "@/components/github-login-button"

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link href="/" className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center gap-2 font-bold text-lg">
        <Rocket className="h-6 w-6" />
        <span>Easy Deploy</span>
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>Sign in with your GitHub account</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <GithubLoginButton />
            <p className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

