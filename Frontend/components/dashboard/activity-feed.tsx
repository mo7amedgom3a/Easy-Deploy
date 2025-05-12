"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, GitBranch, GitCommit, GitMerge, GitPullRequest, User, XCircle, Clock } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { deploymentsService } from "@/lib/services/deployments"
import { deployService } from "@/lib/services/deploy"
import { API_URL } from "@/lib/constants"
import { apiClient } from "@/lib/api-client"

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

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch recent deployments from the backend using the API client
        // which handles token fetching and caching automatically
        try {
          const recentDeployments = await apiClient.get('/deploy/recent?limit=5');
          
          // Process recent deployments
          const deploymentActivities: Activity[] = [];
          if (Array.isArray(recentDeployments)) {
            deploymentActivities.push(...recentDeployments.map(deploy => ({
              id: deploy.id,
              user: {
                name: deploy.owner || "Unknown",
                login: deploy.owner || "unknown",
                avatar: undefined
              },
              type: "deployment" as const,
              status: mapDeploymentStatus(deploy.status),
              action: `deployed ${deploy.repo_name}`,
              project: deploy.repo_name || "Unknown project",
              time: formatTimeAgo(deploy.created_at),
              url: deploy.deployment_url
            })));
          }
          
          // Fallback to GitHub activities if no deployments
          let githubActivities: Activity[] = [];
          if (deploymentActivities.length === 0) {
            // Use the deploymentsService from the frontend to fetch GitHub activities
            const recentGitHubActivities = await deploymentsService.getRecentGitHubActivity(5);
            
            githubActivities = recentGitHubActivities.map(activity => ({
              id: activity.id,
              user: {
                name: activity.author || "Unknown",
                login: activity.author || "unknown",
                avatar: undefined
              },
              type: "commit" as const,
              status: "not_deployed" as const,
              action: `pushed ${activity.commitMessage ? truncateCommitMessage(activity.commitMessage) : 'a commit'}`,
              project: activity.project || "",
              time: activity.time || formatTimeAgo(activity.timestamp),
              url: undefined
            }));
          }
          
          // Combine activities and sort them by time
          const allActivities = [...deploymentActivities, ...githubActivities];
          
          // Sort by timestamp (assuming time strings can be parsed)
          allActivities.sort((a, b) => {
            const timeA = parseTimeString(a.time);
            const timeB = parseTimeString(b.time);
            return timeB - timeA;
          });
          
          // Limit to 6 activities
          setActivities(allActivities.slice(0, 6));
        } catch (apiError: any) {
          console.error("Error fetching deployment data:", apiError);
          
          // Fallback to GitHub activities if API call fails
          const recentGitHubActivities = await deploymentsService.getRecentGitHubActivity(6);
          
          const githubActivities = recentGitHubActivities.map(activity => ({
            id: activity.id,
            user: {
              name: activity.author || "Unknown",
              login: activity.author || "unknown",
              avatar: undefined
            },
            type: "commit" as const,
            status: "not_deployed" as const,
            action: `pushed ${activity.commitMessage ? truncateCommitMessage(activity.commitMessage) : 'a commit'}`,
            project: activity.project || "",
            time: activity.time || formatTimeAgo(activity.timestamp),
            url: undefined
          }));
          
          setActivities(githubActivities);
        }
      } catch (error) {
        console.error("Error fetching activity data:", error);
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

// Helper function to truncate commit messages
function truncateCommitMessage(message: string): string {
  // Get the first line of the commit message
  const firstLine = message.split('\n')[0];
  
  // Truncate if too long
  if (firstLine.length > 60) {
    return firstLine.substring(0, 57) + '...';
  }
  
  return firstLine;
}

// Helper function to parse time strings like "2 hours ago" into millisecond timestamps
function parseTimeString(timeString: string): number {
  const now = new Date().getTime();
  
  // Try to extract numbers and units from the string
  const match = timeString.match(/(\d+)\s+(second|minute|hour|day|month|year)s?\s+ago/);
  
  if (!match) return now; // Default to current time if format doesn't match
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 'second': return now - value * 1000;
    case 'minute': return now - value * 60 * 1000;
    case 'hour': return now - value * 60 * 60 * 1000;
    case 'day': return now - value * 24 * 60 * 60 * 1000;
    case 'month': return now - value * 30 * 24 * 60 * 60 * 1000;
    case 'year': return now - value * 365 * 24 * 60 * 60 * 1000;
    default: return now;
  }
}

// Helper function to map backend status to Activity status type
function mapDeploymentStatus(status: string): "success" | "failed" | "building" | "not_deployed" {
  switch (status) {
    case "success": return "success";
    case "failed": return "failed";
    case "pending": return "building";
    default: return "not_deployed";
  }
}

