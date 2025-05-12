"use client"

import { useEffect, useState } from "react"
import Image from 'next/image'
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Global cache for user profile data
let userProfileCache: {
  data: UserProfile | null;
  timestamp: number;
} | null = null;

// Cache expiration time: 5 minutes
const CACHE_EXPIRATION = 5 * 60 * 1000;

interface UserAvatarProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

interface UserProfile {
  name: string
  avatarUrl: string
  username: string
}

export function UserAvatar({ className, size = "md" }: UserAvatarProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        
        // Check if we have a valid cached profile
        const now = Date.now();
        if (userProfileCache && userProfileCache.data && userProfileCache.timestamp > now - CACHE_EXPIRATION) {
          setProfile(userProfileCache.data);
          setIsLoading(false);
          return;
        }
        
        // Fetch profile if no valid cache exists
        const response = await fetch('/api/user/profile')
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }
        
        const data = await response.json()
        const profileData = {
          name: data.name || data.username || 'User',
          avatarUrl: data.avatarUrl || '',
          username: data.username || '',
        }
        
        // Update the cache
        userProfileCache = {
          data: profileData,
          timestamp: now
        };
        
        setProfile(profileData)
      } catch (err) {
        console.error('Error fetching user profile:', err)
        setError(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [])
  
  // Determine avatar size based on prop
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14"
  }[size]
  
  // Show skeleton while loading
  if (isLoading) {
    return <Skeleton className={`${sizeClass} rounded-full ${className}`} />
  }
  
  // Show user avatar with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className={`${sizeClass} ${className}`}>
            {profile?.avatarUrl ? (
              <AvatarImage 
                src={profile.avatarUrl} 
                alt={profile.name || 'User avatar'} 
              />
            ) : null}
            <AvatarFallback className="bg-primary/10">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{profile?.name || 'User'}</p>
          {profile?.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Add a function to invalidate the user profile cache (can be called on logout)
export function invalidateUserProfileCache() {
  userProfileCache = null;
}