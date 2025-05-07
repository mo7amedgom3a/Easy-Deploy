"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GitHubCallback = () => {
  const router = useRouter();
  const [status, setStatus] = useState("Authenticating with GitHub...");

  useEffect(() => {
    const fetchToken = async () => {
      // Get the code from the URL
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        setStatus("Error: No authorization code received");
        return;
      }

      try {
        // Call our API route that communicates with the backend
        const res = await fetch(`/api/auth/github/callback?code=${code}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          setStatus(`Authentication failed: ${errorData.error || 'Unknown error'}`);
          return;
        }

        const data = await res.json();

        if (data.jwt_token) {
          // Store the token in localStorage
          localStorage.setItem("token", data.jwt_token);
          
          // Redirect to the dashboard
          setStatus("Authentication successful! Redirecting...");
          router.push("/dashboard");
        } else {
          setStatus("Authentication failed: No token received");
        }
      } catch (error) {
        console.error("GitHub callback error:", error);
        setStatus("Authentication error. Please try again.");
      }
    };

    fetchToken();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-card rounded-lg p-8 shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">GitHub Authentication</h1>
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-4 w-full bg-muted rounded"></div>
          </div>
          <p>{status}</p>
        </div>
      </div>
    </div>
  );
};

export default GitHubCallback;