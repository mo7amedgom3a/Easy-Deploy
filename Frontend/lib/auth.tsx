"use client"

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "./constants";

// Define auth context types
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => Promise<void>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
});

// Auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for token in secure httpOnly cookie via an endpoint
        const response = await fetch("/api/auth/check", { // Updated path
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        } else {
          setIsAuthenticated(false);
          console.error("Auth check failed:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function - stores token in an httpOnly cookie via API
  const login = async (token: string) => {
    try {
      const response = await fetch("/api/auth/login", { // Updated path
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
        credentials: "include",
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        console.error("Error saving auth token:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // Logout function - clears httpOnly cookie via API
  const logout = async () => {
    try {
      // Call the logout API and WAIT for the response
      const response = await fetch('/api/auth/logout', { // Updated path
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setIsAuthenticated(false);
        router.push("/");
        router.refresh(); // Force refresh to update UI state
      } else {
        console.error("Logout API error:", response.status, response.statusText);
        // Still log out locally even if API call fails
        setIsAuthenticated(false);
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still log out locally even if API call fails
      setIsAuthenticated(false);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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