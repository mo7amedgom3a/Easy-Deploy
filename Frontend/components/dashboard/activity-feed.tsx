"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, GitBranch, GitCommit, GitMerge, GitPullRequest, User, XCircle, Clock } from "lucide-react"
import { githubService } from "@/lib/services/github"
import { Skeleton } from "@/components/ui/skeleton"

interface Activity {
  id: string;
  user: {
    name: string;
    login: string;
    avatar?: string;
  };
  type: "deployment" | "commit" | "pr" | "merge" | "user";
  status?: "success" | "failed" | "building" | "not_deployed";
  action: string;
  project: string;
  time: string;
  url?: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get GitHub user info
        const githubUser = await githubService.getCurrentUser();
        if (!githubUser) {
          setError("Could not retrieve GitHub account information");
          setIsLoading(false);
          return;
        }
        
        // Get repositories for this user
        const repos = await githubService.getRepositories(githubUser.login);
        
        if (!repos || repos.length === 0) {
          setError("No GitHub repositories found");
          setIsLoading(false);
          return;
        }
        
        // Gather recent commits from up to 3 repositories
        const allActivities: Activity[] = [];
        const reposToCheck = Math.min(repos.length, 3); 
        
        for (let i = 0; i < reposToCheck; i++) {
          const repo = repos[i];
          try {
            // Get commits for this repository
            const commits = await githubService.getCommits(
              githubUser.login, 
              repo.name, 
              repo.default_branch || 'main'
            );
            
            // Convert commits to activity items
            const commitActivities = commits.slice(0, 3).map(commit => ({
              id: commit.sha,
              user: {
                name: commit.commit.author.name,
                login: commit.author?.login || githubUser.login,
                avatar: commit.author?.avatar_url,
              },
              type: "commit" as const,
              action: `pushed ${formatCommitMessage(commit.commit.message)}`,
              project: repo.name,
              time: formatTimeAgo(commit.commit.author.date),
              url: commit.html_url,
            }));
            
            allActivities.push(...commitActivities);
          } catch (error) {
            console.error(`Error fetching commits for ${repo.name}:`, error);
          }
        }
        
        // Sort activities by time
        const sortedActivities = allActivities.sort((a, b) => {
          const timeA = new Date(a.time).getTime();
          const timeB = new Date(b.time).getTime();
          return timeB - timeA;
        });
        
        // Limit to 6 activities
        setActivities(sortedActivities.slice(0, 6));
      } catch (error) {
        console.error("Error fetching GitHub activity:", error);
        setError("Failed to load activity data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivities();
  }, []);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>{error}</p>
      </div>
    );
  }
  
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>No recent activity found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="relative mt-1">
            <Avatar className="h-8 w-8">
              {activity.user.avatar ? (
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              ) : null}
              <AvatarFallback>
                {activity.user.name ? activity.user.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            {activity.type === "deployment" && activity.status === "success" && (
              <CheckCircle2 className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-green-500" />
            )}
            {activity.type === "deployment" && activity.status === "failed" && (
              <XCircle className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-destructive" />
            )}
            {activity.type === "deployment" && activity.status === "building" && (
              <Clock className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-orange-500 animate-spin" />
            )}
            {activity.type === "commit" && (
              <GitCommit className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-blue-500" />
            )}
            {activity.type === "pr" && (
              <GitPullRequest className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-purple-500" />
            )}
            {activity.type === "merge" && (
              <GitMerge className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-indigo-500" />
            )}
            {activity.type === "user" && (
              <User className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-orange-500" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.user.name}
              <span className="text-muted-foreground"> {activity.action}</span>
            </p>
            <p className="text-sm text-muted-foreground">{activity.project}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to format commit messages (truncate and clean up)
function formatCommitMessage(message: string): string {
  // Get the first line of the commit message
  const firstLine = message.split('\n')[0];
  
  // Truncate if too long
  if (firstLine.length > 60) {
    return firstLine.substring(0, 57) + '...';
  }
  
  return firstLine;
}

// Format time string as "X time ago"
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (isNaN(secondsAgo) || secondsAgo < 0) {
    return 'Recently';
  }
  
  if (secondsAgo < 60) {
    return `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`;
  }
  
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
  }
  
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
  }
  
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 30) {
    return `${daysAgo} day${daysAgo === 1 ? '' : 's'} ago`;
  }
  
  const monthsAgo = Math.floor(daysAgo / 30);
  if (monthsAgo < 12) {
    return `${monthsAgo} month${monthsAgo === 1 ? '' : 's'} ago`;
  }
  
  const yearsAgo = Math.floor(monthsAgo / 12);
  return `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago`;
}

