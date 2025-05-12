"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { API_URL } from "@/lib/constants"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get error message from URL if present
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch(urlError) {
        case 'no_code':
          errorMessage = 'GitHub authorization failed: No authorization code received.';
          break;
        case 'no_token':
          errorMessage = 'Authentication failed: No token received from server.';
          break;
        case 'auth_failed':
          errorMessage = 'GitHub authentication failed. Please try again.';
          break;
        case 'unknown':
          errorMessage = 'An unknown error occurred during authentication.';
          break;
        default:
          errorMessage = `Authentication error: ${urlError}`;
      }
      
      setError(errorMessage);
    }
  }, [searchParams])

  const handleGitHubLogin = async () => {
    setLoading(true)
    setError(null)

    try {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard'
      
      // Redirect directly to GitHub auth URL
      // The backend will handle the redirect to GitHub's OAuth page
      window.location.href = `${API_URL}/auth/login?state=${encodeURIComponent(redirectTo)}`
    } catch (err) {
      console.error('Failed to initiate GitHub login:', err)
      setError('Failed to connect to authentication service. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Easy Deploy</CardTitle>
          <CardDescription className="text-center">
            Log in to deploy your applications with ease
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGitHubLogin}
            disabled={loading}
          >
            <Github className="mr-2 h-4 w-4" />
            {loading ? 'Connecting...' : 'Continue with GitHub'}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-center text-gray-500">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

