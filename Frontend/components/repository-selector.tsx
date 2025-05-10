"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Github } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Repository {
  id: number
  name: string
  full_name: string
  html_url?: string
  description?: string
  visibility?: string
  default_branch?: string
  language?: string
  created_at?: string
  updated_at?: string
  owner?: {
    login: string
    avatar_url?: string
  }
}

interface RepositorySelectorProps {
  repositories?: Repository[]
  loading?: boolean
  value?: string
  onChange: (value: string) => void
  error?: string
  username?: string
  onRetry?: () => void
}

export function RepositorySelector({
  repositories: externalRepositories,
  loading: externalLoading,
  value,
  onChange,
  error: externalError,
  username,
  onRetry
}: RepositorySelectorProps) {
  const [repositories, setRepositories] = useState<Repository[]>(externalRepositories || [])
  const [loading, setLoading] = useState<boolean>(externalLoading || false)
  const [error, setError] = useState<string | null>(externalError || null)

  // If repositories are provided externally, use them
  useEffect(() => {
    if (externalRepositories) {
      console.log("Using external repositories:", externalRepositories);
      setRepositories(externalRepositories);
      return;
    }

    if (!username) return;

    const fetchRepositories = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching repositories for user: ${username}`);
        const response = await fetch(`/api/repository/github?username=${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          let errorMessage = `Failed to fetch repositories: ${response.statusText}`;
          try {
            const errorData = await response.json();
            console.error("Repository error response:", errorData);
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Error parsing repository error response");
          }
          throw new Error(errorMessage);
        }

        let data;
        try {
          const text = await response.text();
          console.log("Repository response text:", text.substring(0, 200) + (text.length > 200 ? '...' : ''));
          data = JSON.parse(text);
        } catch (err) {
          console.error("Error parsing repository response:", err);
          throw new Error("Invalid response format");
        }
        
        console.log("Repository data received:", data);
        
        if (Array.isArray(data)) {
          console.log(`Received ${data.length} repositories`);
          
          // Filter out invalid repositories and ensure all required fields
          const validRepos = data.filter(repo => 
            repo && typeof repo === 'object' && (repo.id || repo.name || repo.full_name)
          ).map(repo => ({
            id: repo.id || Math.floor(Math.random() * 1000000),
            name: repo.name || repo.full_name?.split('/').pop() || 'Unknown Repository',
            full_name: repo.full_name || `${username}/${repo.name || 'unknown'}`,
            visibility: repo.visibility || 'public',
            ...repo
          }));
          
          console.log(`Found ${validRepos.length} valid repositories`);
          setRepositories(validRepos);
        } else {
          console.error("Unexpected response format:", data);
          throw new Error("Invalid response format: not an array");
        }
      } catch (err) {
        console.error("Error fetching repositories:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch repositories");
      } finally {
        setLoading(false);
      }
    };

    fetchRepositories();
  }, [username, externalRepositories]);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (username) {
      // Refetch repositories
      const fetchRepositories = async () => {
        setLoading(true);
        setError(null);
  
        try {
          console.log(`Retrying repository fetch for user: ${username}`);
          const response = await fetch(`/api/repository/github?username=${username}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
  
          if (!response.ok) {
            let errorMessage = `Failed to fetch repositories: ${response.statusText}`;
            try {
              const errorData = await response.json();
              console.error("Repository error response:", errorData);
              errorMessage = errorData.error || errorMessage;
            } catch (e) {
              console.error("Error parsing repository error response");
            }
            throw new Error(errorMessage);
          }
  
          let data;
          try {
            const text = await response.text();
            console.log("Repository retry response text:", text.substring(0, 200) + (text.length > 200 ? '...' : ''));
            data = JSON.parse(text);
          } catch (err) {
            console.error("Error parsing repository retry response:", err);
            throw new Error("Invalid response format");
          }
          
          console.log("Repository retry data received:", data);
          
          if (Array.isArray(data)) {
            console.log(`Received ${data.length} repositories on retry`);
            
            // Filter out invalid repositories and ensure all required fields
            const validRepos = data.filter(repo => 
              repo && typeof repo === 'object' && (repo.id || repo.name || repo.full_name)
            ).map(repo => ({
              id: repo.id || Math.floor(Math.random() * 1000000),
              name: repo.name || repo.full_name?.split('/').pop() || 'Unknown Repository',
              full_name: repo.full_name || `${username}/${repo.name || 'unknown'}`,
              visibility: repo.visibility || 'public',
              ...repo
            }));
            
            console.log(`Found ${validRepos.length} valid repositories on retry`);
            setRepositories(validRepos);
          } else {
            console.error("Unexpected retry response format:", data);
            throw new Error("Invalid response format: not an array");
          }
        } catch (err) {
          console.error("Error retrying repositories fetch:", err);
          setError(err instanceof Error ? err.message : "Failed to fetch repositories");
        } finally {
          setLoading(false);
        }
      };
  
      fetchRepositories();
    }
  };

  // Handler for select changes with safety checks
  const handleValueChange = (newValue: string) => {
    if (typeof newValue === 'string' && newValue) {
      console.log("Repository selected:", newValue);
      onChange(newValue);
    } else {
      console.warn("Invalid value passed to repository selector", newValue);
    }
  };

  // Debug repositories state
  useEffect(() => {
    console.log("Current repositories state:", repositories);
  }, [repositories]);

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error || externalError) {
    return (
      <div className="text-red-500 text-sm border border-red-300 rounded-md p-3">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <p>{error || externalError}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRetry}
          className="mt-1"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Select
      value={value}
      onValueChange={handleValueChange}
      disabled={repositories.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a repository" />
      </SelectTrigger>
      <SelectContent>
        {repositories.length === 0 ? (
          <div className="p-2 text-sm text-center text-gray-500" key="no-repos">
            No repositories found
          </div>
        ) : (
          repositories.map((repo) => {
            // Safety check for invalid repo data
            if (!repo || !repo.full_name) {
              console.warn("Skipping invalid repository:", repo);
              return null;
            }
            
            const repoId = repo.id ? repo.id.toString() : `repo-${Math.random()}`;
            const repoName = repo.name || repo.full_name.split('/').pop() || 'Unknown';
            
            return (
              <SelectItem 
                key={repoId} 
                value={repo.full_name}
              >
                <div className="flex items-center">
                  <Github className="mr-2 h-4 w-4" />
                  <span>{repoName}</span>
                  <span className="ml-auto text-xs text-gray-500">{repo.visibility || 'public'}</span>
                </div>
              </SelectItem>
            );
          })
        )}
      </SelectContent>
    </Select>
  )
} 