"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { API_URL } from "./constants";
import { apiClient } from "./api-client";
import { invalidateUserProfileCache } from "@/components/dashboard/user-avatar";

// Define user type
type User = {
  id: string;
  login: string;
  github_id: string;
};

// Define auth context types
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: async () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        setUser(data.user || null);

        // If user is authenticated and on a public route, redirect to dashboard
        if (data.isAuthenticated && !pathname.startsWith('/dashboard')) {
          router.push('/dashboard');
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        console.error("Auth check failed:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on mount and when router changes
  useEffect(() => {
    checkAuth();
  }, [router, pathname]);

  // Login function - redirects to GitHub OAuth
  const login = () => {
    // Get current path for redirect after login
    const currentPath = window.location.pathname;
    const state = encodeURIComponent(currentPath);
    
    // Redirect to backend login endpoint which will handle GitHub OAuth
    window.location.href = `${API_URL}/auth/login?state=${state}`;
  };

  // Logout function - clears cookie via API
  const logout = async () => {
    try {
      // Call the logout API and WAIT for the response
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        setUser(null);
        // Invalidate all caches when logging out
        apiClient.invalidateTokenCache();
        invalidateUserProfileCache();
        router.push("/");
        router.refresh(); // Force refresh to update UI state
      } else {
        console.error("Logout API error:", response.status, response.statusText);
        // Still log out locally even if API call fails
        setIsAuthenticated(false);
        setUser(null);
        // Invalidate all caches even on API failure
        apiClient.invalidateTokenCache();
        invalidateUserProfileCache();
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still log out locally even if API call fails
      setIsAuthenticated(false);
      setUser(null);
      // Invalidate all caches even on error
      apiClient.invalidateTokenCache();
      invalidateUserProfileCache();
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Utility function to check if a route is protected
export const isProtectedRoute = (path: string) => {
  return path.startsWith("/dashboard");
};