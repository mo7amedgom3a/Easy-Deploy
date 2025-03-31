import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle2, GitBranch, GitMerge, GitPullRequest, User, XCircle } from "lucide-react"

export function ActivityFeed() {
  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-4">
          <div className="relative mt-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {activity.type === "deployment" && activity.status === "success" && (
              <CheckCircle2 className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-green-500" />
            )}
            {activity.type === "deployment" && activity.status === "failed" && (
              <XCircle className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-destructive" />
            )}
            {activity.type === "commit" && (
              <GitBranch className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white text-blue-500" />
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

const activities = [
  {
    user: {
      name: "John Doe",
      avatar: "",
    },
    type: "deployment",
    status: "success",
    action: "deployed to production",
    project: "E-commerce Frontend",
    time: "2 minutes ago",
  },
  {
    user: {
      name: "Sarah Johnson",
      avatar: "",
    },
    type: "deployment",
    status: "failed",
    action: "failed to deploy",
    project: "API Backend",
    time: "15 minutes ago",
  },
  {
    user: {
      name: "Mike Chen",
      avatar: "",
    },
    type: "commit",
    action: "pushed 3 commits",
    project: "Marketing Website",
    time: "1 hour ago",
  },
  {
    user: {
      name: "Emily Wilson",
      avatar: "",
    },
    type: "pr",
    action: "opened a pull request",
    project: "Admin Dashboard",
    time: "3 hours ago",
  },
  {
    user: {
      name: "Alex Rodriguez",
      avatar: "",
    },
    type: "merge",
    action: "merged a pull request",
    project: "Mobile App Backend",
    time: "5 hours ago",
  },
  {
    user: {
      name: "Lisa Taylor",
      avatar: "",
    },
    type: "user",
    action: "joined the team",
    project: "",
    time: "1 day ago",
  },
]

