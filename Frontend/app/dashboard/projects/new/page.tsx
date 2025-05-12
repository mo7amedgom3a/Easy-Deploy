"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Github, FileCode, Cog, Terminal, FileJson, Loader2, AlertCircle } from "lucide-react"
import { projectsService } from "@/lib/services/projects"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DirectorySelector } from "@/components/directory-selector/directory-selector"
import { RepositorySelector } from "@/components/repository-selector"
import { API_URL } from "@/lib/constants"



interface DirectoryInfo {
  path: string
  sha: string
}

interface GithubUser {
  login: string
  name: string
  avatar_url: string
  [key: string]: any
}

// Add new interfaces for framework data
interface FrameworkInfo {
  port: string;
  entry_point: string;
  build_command: string;
  run_command: string;
}

interface FrameworkCategories {
  backend: Record<string, FrameworkInfo>;
  frontend: Record<string, FrameworkInfo>;
}

export default function NewProjectPage() {
  const [user, setUser] = useState<GithubUser | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [repositories, setRepositories] = useState<any[]>([])
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [branches, setBranches] = useState<string[]>(["main", "develop", "master"])
  const [githubUser, setGithubUser] = useState<any>(null)
  const [authError, setAuthError] = useState<string>("")
  const [repoLoading, setRepoLoading] = useState(false)
  const [repoName, setRepoName] = useState<string>("")
  const [owner, setOwner] = useState<string>("")
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New state for environment variables as key-value pairs
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([
    { key: "", value: "" }
  ]);

  const [frameworks, setFrameworks] = useState<FrameworkCategories | null>(null);
  const [frameworkCategory, setFrameworkCategory] = useState<'backend' | 'frontend'>('backend');
  const [frameworksLoading, setFrameworksLoading] = useState(false);
  const [frameworkError, setFrameworkError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get token first
      let token = null;
      try {
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.token;
        } else {
          throw new Error("Authentication token not found");
        }
      } catch (tokenError) {
        console.error("Token fetch error:", tokenError);
        setError("Authentication error. Please try logging in again.");
        setLoading(false);
        return;
      }
      
      // Make authorized request to get user info
      const response = await fetch(`${API_URL}/users/github/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GitHub API error:", response.status, response.statusText, errorText);
        throw new Error(`Failed to fetch user information: ${response.statusText}`);
      }

      const data = await response.json();
      setUser(data);
      setOwner(data.login);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching user information:", err);
    } finally {
      setLoading(false);
    }
  }



  const handleDirectorySelect = (directory: DirectoryInfo) => {
    if (!directory) {
      console.error("No directory provided to handleDirectorySelect");
      return;
    }

    console.log("Selected directory in handleDirectorySelect:", JSON.stringify(directory));
    setSelectedDirectory(directory);
    
    // Update the form data with the selected directory path
    // Use actual path or default to "/" if no path or it's the root
    let directoryPath = "/"; // Default to root
    
    if (directory.path && directory.path !== "/") {
      // Format the path correctly - ensure it doesn't have double slashes
      directoryPath = directory.path.startsWith("/") ? directory.path : `/${directory.path}`;
    }
    
    console.log(`Setting rootDirectory in form data to: "${directoryPath}"`);
    
    setFormData(prev => ({
      ...prev,
      rootDirectory: directoryPath
    }));
  }
  

  const handleRepoNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoName(e.target.value)
    // Reset selected directory when repo changes
    setSelectedDirectory(null)
  }
  

  // Form state - updated to match the API requirements
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    repository: "",
    branch: "main",
    rootDirectory: "/",
    framework: "",
    frameworkCategory: "backend",
    port: "5000",
    installCommand: "pip install -r requirements.txt",
    buildCommand: "",
    startCommand: "flask run",
    environmentVariables: "",
    appEntryPoint: "app.py",
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle select changes
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  // Handle switch changes
  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  // Handle repository selection
  const handleRepoChange = async (repoFullName: string) => {
    if (!repoFullName) {
      console.log("No repository selected");
      return;
    }
    
    console.log("Repository selected:", repoFullName);
    setSelectedRepo(repoFullName);
    
    // Parse the repository full name to extract owner and repo name
    const parts = repoFullName.split('/');
    if (parts.length !== 2) {
      console.error("Invalid repository name format:", repoFullName);
      return;
    }
    
    const newOwner = parts[0];
    const newRepoName = parts[1];
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      repository: repoFullName,
      name: newRepoName || prev.name // Use repo name as project name if available
    }));
    
    // Reset selected directory when repo changes
    setSelectedDirectory(null);
    
    // Set owner and repo name for directory selection
    console.log(`Setting owner=${newOwner} and repoName=${newRepoName} for directory selection`);
    setOwner(newOwner);
    setRepoName(newRepoName);
    
    // Get selected repository info to potentially get real branches
    const selectedRepository = repositories.find(repo => repo.full_name === repoFullName);
    if (selectedRepository) {
      setFormData(prev => ({
        ...prev,
        description: selectedRepository.description || prev.description
      }));

      // Attempt to get branches for the selected repository
      try {
        setRepoLoading(true);
        // Safely split the repository full name
        const parts = repoFullName.split('/');
        const owner = parts[0];
        const repo = parts[1];
        
        if (owner && repo) {
          console.log(`Setting owner=${owner} and repoName=${repo} for directory selection`);
          // Set repo name and owner for directory selection
          setRepoName(repo);
          setOwner(owner);
          
          // Log to verify owner and repo are set correctly
          console.log(`After setting: owner=${owner}, repoName=${repo}`);
          
          // Add default branch to the branches list if available
          if (selectedRepository.default_branch && !branches.includes(selectedRepository.default_branch)) {
            setBranches(prev => [...prev, selectedRepository.default_branch]);
            // Set as selected branch
            setFormData(prev => ({
              ...prev,
              branch: selectedRepository.default_branch
            }));
          }
          
          // Try to fetch all branches from the repo
          try {
            // Get token for authentication with proper error handling
            let token = null;
            try {
              const tokenResponse = await fetch('/api/auth/token', {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              if (tokenResponse.ok) {
                const tokenData = await tokenResponse.json();
                token = tokenData.token;
                console.log("Branch fetch: Successfully retrieved auth token");
              } else {
                console.error("Branch fetch: Failed to get auth token:", tokenResponse.status);
                throw new Error("Failed to get authentication token for branch fetch");
              }
            } catch (tokenError) {
              console.error("Branch fetch: Token error:", tokenError);
              setAuthError("Failed to retrieve authentication token. Please try logging in again.");
              return;
            }

            if (!token) {
              console.error("Branch fetch: No token available");
              setAuthError("Authentication token is missing. Please try logging in again.");
              return;
            }
            
            const branchesUrl = `${API_URL}/git/repository/${owner}/${repo}/branches`;
            console.log("Fetching branches from:", branchesUrl);
            
            const branchesResponse = await fetch(branchesUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              credentials: 'include'
            });
            
            if (!branchesResponse.ok) {
              console.error("Branch fetch: API error:", branchesResponse.status);
              const errorText = await branchesResponse.text();
              console.error("Branch fetch: Error response:", errorText);
              throw new Error(`Branch API error: ${branchesResponse.status}`);
            }
            
            const branchesData = await branchesResponse.json();
            console.log("Branches data:", branchesData);
            
            if (Array.isArray(branchesData) && branchesData.length > 0) {
              const branchNames = branchesData.map(branch => branch.name || branch);
              console.log("Setting branches:", branchNames);
              setBranches(branchNames);
            } else {
              console.log("No branches found or invalid response format, using defaults");
            }
          } catch (branchError) {
            console.error("Error fetching branches:", branchError);
            // If API doesn't support branches endpoint, fallback to the default branches
            // Add default branch from the repository if available
            if (selectedRepository.default_branch && !branches.includes(selectedRepository.default_branch)) {
              setBranches(prev => [...prev, selectedRepository.default_branch]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching repository details:", error);
      } finally {
        setRepoLoading(false);
      }
    }
  };

  // Parse environment variables from array of key-value objects
  const parseEnvironmentVariables = (): Record<string, string> | undefined => {
    const validEnvVars = envVars.filter(env => env.key.trim() !== "");
    if (validEnvVars.length === 0) return undefined;
    
    const envVarsObj: Record<string, string> = {};
    validEnvVars.forEach(({ key, value }) => {
      envVarsObj[key.trim()] = value;
    });
    
    return Object.keys(envVarsObj).length > 0 ? envVarsObj : undefined;
  }

  // Handle adding a new environment variable entry
  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  // Handle updating env var key or value
  const updateEnvVar = (index: number, field: 'key' | 'value', value: string) => {
    const updatedEnvVars = [...envVars];
    updatedEnvVars[index][field] = value;
    setEnvVars(updatedEnvVars);
  };

  // Handle removing an env var entry
  const removeEnvVar = (index: number) => {
    const updatedEnvVars = [...envVars];
    updatedEnvVars.splice(index, 1);
    setEnvVars(updatedEnvVars);
  };

  // Attempt to refresh GitHub auth and data
  const refreshGitHubData = async () => {
    setAuthError("");
    await fetchGitHubData();
  }

  // Fetch GitHub user and repositories with retry mechanism
  const fetchGitHubData = async (retryCount = 0) => {
    setIsLoading(true);
    setAuthError("");
    setRepositories([]); // Clear existing repositories
    
    try {
      // Get authentication token for all API requests
      let token = null;
      
      try {
        // Get token from the local API
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store' // Ensure we don't get a cached token
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.token;
          console.log("Successfully retrieved auth token");
        } else {
          console.error("Failed to get auth token:", tokenResponse.status, tokenResponse.statusText);
          throw new Error(`Failed to get authentication token: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }
      } catch (error) {
        const tokenError = error as Error;
        console.error("Token fetch error:", tokenError);
        setAuthError("Failed to retrieve authentication token. Please try logging in again.");
        setIsLoading(false);
        return;
      }
      
      if (!token) {
        console.error("No token available");
        setAuthError("Authentication token is missing. Please try logging in again.");
        setIsLoading(false);
        return;
      }
      
      // Make authorized request to get user info
      let user;
      try {
        // Use the backend API directly with the token
        const userResponse = await fetch(`${API_URL}/users/github/me/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });
        
        if (!userResponse.ok) {
          const status = userResponse.status;
          console.error("GitHub API error:", status, userResponse.statusText);
          
          let errorText = "";
          try {
            errorText = await userResponse.text();
            console.error("Error response:", errorText);
          } catch (e) {
            console.error("Failed to parse error response");
          }
          
          // Handle specific error cases
          if (status === 401) {
            throw new Error("Authentication failed. Please log in again.");
          } else if (status === 403) {
            throw new Error("Access forbidden. You may need additional permissions.");
          } else if (status === 404) {
            throw new Error("GitHub user information not found.");
          } else if (status >= 500) {
            throw new Error("GitHub API server error. Please try again later.");
          }
          
          throw new Error(`GitHub API error: ${status} ${userResponse.statusText}`);
        }
        
        const userData = await userResponse.json();
        if (!userData || typeof userData !== 'object') {
          console.error("Invalid user response:", userData);
          throw new Error("Invalid user data received from API");
        }
        
        user = userData;
        setGithubUser(user);
        console.log("GitHub user retrieved:", user.login);
        
        // Also update the owner state
        if (user.login) {
          setOwner(user.login);
        }
        
      } catch (error) {
        const userError = error as Error;
        console.error("User fetch error:", userError);
        
        // If we're getting an authentication error and haven't retried too much,
        // we can attempt a retry in case the token was just temporarily invalid
        if (userError.message && userError.message.includes("Authentication failed") && retryCount < 2) {
          console.log(`Authentication failed, attempting retry ${retryCount + 1}/2`);
          setTimeout(() => {
            setIsLoading(false);
            fetchGitHubData(retryCount + 1); // Retry with incremented counter
          }, 1000); // Add a small delay before retrying
          return;
        }
        
        setAuthError(`Failed to retrieve GitHub user: ${userError.message || "Unknown error"}`);
        setIsLoading(false);
        return;
      }
      
      if (user?.login) {
        // Get repositories for the user using our frontend API route
        try {
          console.log(`Fetching repositories for user: ${user.login}`);
          
          // Try direct API call first 
          const reposUrl = `${API_URL}/git/repository/${user.login}`;
          console.log("Fetching repositories directly from backend API:", reposUrl);
          
          const directReposResponse = await fetch(reposUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          if (directReposResponse.ok) {
            const reposData = await directReposResponse.json();
            console.log("Direct API response:", reposData);
            
            if (Array.isArray(reposData) && reposData.length > 0) {
              console.log(`Found ${reposData.length} repositories`);
              setRepositories(reposData);
              setAuthError(""); // Clear any previous errors
              setIsLoading(false);
              return;
            } else {
              console.log("No repositories found in direct API response or invalid format");
            }
          } else {
            console.log("Direct API call failed, will try frontend API route");
          }
          
          // If direct API fails, try the frontend API route
          const reposResponse = await fetch(`/api/repository/github?username=${user.login}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          if (!reposResponse.ok) {
            const status = reposResponse.status;
            console.error("Repos API error:", status, reposResponse.statusText);
            
            let errorText = "";
            let errorData = null;
            try {
              const responseText = await reposResponse.text();
              try {
                errorData = JSON.parse(responseText);
                console.error("Error response data:", errorData);
                errorText = errorData.error || errorData.details || reposResponse.statusText;
              } catch {
                console.error("Error response text:", responseText);
                errorText = responseText || reposResponse.statusText;
              }
            } catch (e) {
              console.error("Failed to parse error response");
              errorText = "Failed to parse repository data";
            }
            
            // Handle different repository fetch error scenarios
            if (status === 401) {
              throw new Error("Authentication failed when fetching repositories.");
            } else if (status === 403) {
              throw new Error("Access forbidden to repositories. Check your GitHub permissions.");
            } else if (status === 404) {
              throw new Error("No repositories found for this user.");
            }
            
            throw new Error(`Repository API error: ${errorText}`);
          }
          
          let repos;
          try {
            const responseText = await reposResponse.text();
            try {
              repos = JSON.parse(responseText);
              console.log("Repositories response:", repos);
            } catch (e) {
              console.error("Failed to parse JSON from repository response:", responseText);
              throw new Error("Invalid repository data format");
            }
          } catch (e) {
            console.error("Error processing repository response:", e);
            throw new Error("Failed to process repository data");
          }
          
          if (Array.isArray(repos)) {
            console.log(`Found ${repos.length} repositories:`, repos.map(r => r.full_name || r.name).join(", "));
            if (repos.length > 0) {
              setRepositories(repos);
              setAuthError(""); // Clear any previous errors
            } else {
              console.log("Empty repositories array returned");
              setAuthError("No repositories found. Please ensure your GitHub account has repositories.");
            }
          } else if (repos && repos.error) {
            console.error("Error in repositories response:", repos.error);
            setAuthError(`Error: ${repos.error}`);
          } else {
            console.error("Unexpected repository response format:", repos);
            setAuthError("Received invalid repository data. Please try again.");
          }
        } catch (error) {
          const reposError = error as Error;
          console.error("Repositories fetch error:", reposError);
          setAuthError(`Failed to fetch GitHub repositories: ${reposError.message || "Unknown error"}`);
        }
      } else {
        setAuthError("Could not retrieve GitHub user information. Please try logging in again.");
      }
    } catch (error) {
      const err = error as Error;
      console.error("Error fetching GitHub data:", err);
      setAuthError(`Failed to fetch GitHub data: ${err.message || "Unknown error"}`);
      toast({
        title: "Error",
        description: "Failed to fetch GitHub repositories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Initial data load
  useEffect(() => {
    fetchGitHubData()
  }, [])

  // Initialize root directory when owner and repoName are set
  useEffect(() => {
    if (owner && repoName && !selectedDirectory) {
      console.log(`Initializing root directory for ${owner}/${repoName}`);
      
      // Create a default root directory
      const rootDir = {
        path: "/",
        sha: "root"
      };
      
      handleDirectorySelect(rootDir);
    }
  }, [owner, repoName, selectedDirectory]);

  // Fetch available frameworks
  const fetchFrameworks = async () => {
    setFrameworksLoading(true);
    setFrameworkError(null);
    
    try {
      // Get token for authentication
      let token = null;
      try {
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.token;
        } else {
          throw new Error("Authentication token not found");
        }
      } catch (tokenError) {
        console.error("Token fetch error:", tokenError);
        setFrameworkError("Authentication error. Please try logging in again.");
        setFrameworksLoading(false);
        return;
      }
      
      // Make the API request
      const response = await fetch(`${API_URL}/deploy/frameworks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch frameworks: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Frameworks data:", data);
      setFrameworks(data);
      
      // Set Flask as default if available
      if (data?.backend?.flask) {
        setFormData(prev => ({
          ...prev,
          framework: "flask",
          frameworkCategory: "backend",
          port: data.backend.flask.port,
          installCommand: data.backend.flask.build_command,
          startCommand: data.backend.flask.run_command,
          appEntryPoint: data.backend.flask.entry_point
        }));
      }
      
    } catch (error) {
      console.error("Error fetching frameworks:", error);
      setFrameworkError(error instanceof Error ? error.message : "Failed to load frameworks");
    } finally {
      setFrameworksLoading(false);
    }
  };
  
  // Load frameworks on initial render
  useEffect(() => {
    fetchFrameworks();
  }, []);
  
  // Update form when framework changes
  const handleFrameworkChange = (frameworkName: string, category: 'backend' | 'frontend') => {
    if (!frameworks) return;
    
    const frameworkInfo = frameworks[category][frameworkName];
    if (!frameworkInfo) return;
    
    setFormData(prev => ({
      ...prev,
      framework: frameworkName,
      frameworkCategory: category,
      port: frameworkInfo.port,
      installCommand: frameworkInfo.build_command,
      startCommand: frameworkInfo.run_command,
      appEntryPoint: frameworkInfo.entry_point
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Parse repository info to get owner and repo name
      const [owner, repoName] = formData.repository.split('/');
      
      // Get authentication token for API request
      let authToken = null;
      try {
        const tokenResponse = await fetch('/api/auth/token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          cache: 'no-store'
        });
        
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          authToken = tokenData.token;
        } else {
          throw new Error("Failed to retrieve authentication token");
        }
      } catch (tokenError) {
        console.error("Token fetch error:", tokenError);
        throw new Error("Authentication error. Please try logging in again.");
      }
      
      if (!authToken) {
        throw new Error("Authentication token is missing");
      }
      
      // Create deployment data based on API requirements
      const deploymentData = {
        repo_name: repoName,
        owner: owner,
        branch: formData.branch,
        framework: formData.framework,
        root_folder_path: formData.rootDirectory || "/", 
        port: formData.port,
        environment_variables: parseEnvironmentVariables(),
        build_command: formData.installCommand,
        run_command: formData.startCommand,
        app_entry_point: formData.appEntryPoint
      }
      
      console.log("Submitting deployment data:", deploymentData);
      
      // Use the deploy service to create a new deployment
      const result = await fetch(`${API_URL}/deploy/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(deploymentData),
      });
      
      if (!result.ok) {
        const errorData = await result.text();
        console.error("Deploy API error:", errorData);
        throw new Error(`Failed to create deployment: ${result.status} ${result.statusText}`);
      }
      
      const deploymentResult = await result.json();
      
      toast({
        title: "Success!",
        description: "Project deployment initiated successfully",
      })
      
      // Redirect to project page - update the redirect as needed based on your actual routes
      router.push(`/dashboard/projects/${deploymentResult.deployment_id || deploymentResult.id}`)
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Failed to create project",
        description: "There was an error creating your project. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-full md:max-w-4xl mx-auto pb-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Create New Project</h1>
      </div>

      {authError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
            <span>{authError}</span>
            <Button size="sm" variant="outline" onClick={() => fetchGitHubData(0)} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Github className="h-4 w-4 mr-2" />}
              Reconnect GitHub
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full">
        <CardHeader className="px-4 md:px-6">
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Enter the details for your new project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 px-4 md:px-6">
              {/* Basic Project Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" placeholder="My Awesome Project" value={formData.name} onChange={handleInputChange} />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="A brief description of your project"
                      className="min-h-[80px]"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Repository Information */}
              <div className="space-y-6 pt-4 border-t">
                <h3 className="text-lg font-medium">GitHub Repository</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="repository">Repository</Label>
                    <RepositorySelector
                      username={user?.login}
                      onChange={handleRepoChange}
                      value={selectedRepo}
                      error={authError}
                      onRetry={refreshGitHubData}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Select a repository to deploy
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <Select onValueChange={(value) => handleSelectChange("branch", value)} defaultValue={formData.branch}>
                      <SelectTrigger id="branch">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch}>
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {/* Source Code Location */}
              {owner && repoName && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Source Code Location</h3>
                  <div className="space-y-2">
                    <Label>Root Directory</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Select the directory where your source code is located.
                    </p>
                    
                    <DirectorySelector 
                      owner={owner} 
                      repoName={repoName} 
                      onDirectorySelected={(dir) => {
                        console.log("Directory selected in parent:", dir);
                        handleDirectorySelect(dir);
                      }} 
                    />
                    
                    <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                      <span className="font-semibold">Selected path:</span> {formData.rootDirectory === "/" ? "/ (root)" : formData.rootDirectory}
                      {selectedDirectory && (
                        <span className="text-xs text-muted-foreground ml-2">
                          (SHA: {selectedDirectory.sha.substring(0, 7)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Framework Selection */}
              <div className="space-y-6 pt-4 border-t">
                <h3 className="text-lg font-medium">Framework</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="frameworkCategory">Framework Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant={formData.frameworkCategory === "backend" ? "default" : "outline"}
                        className="w-full"
                        onClick={() => setFormData(prev => ({ ...prev, frameworkCategory: "backend" }))}
                      >
                        Backend
                      </Button>
                      <Button
                        type="button"
                        variant={formData.frameworkCategory === "frontend" ? "default" : "outline"} 
                        className="w-full"
                        onClick={() => setFormData(prev => ({ ...prev, frameworkCategory: "frontend" }))}
                      >
                        Frontend
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="framework">Select Framework</Label>
                    {frameworksLoading ? (
                      <div className="flex items-center space-x-2 p-4 bg-muted rounded-md">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading frameworks...</span>
                      </div>
                    ) : frameworkError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription className="flex items-center justify-between">
                          <span>{frameworkError}</span>
                          <Button size="sm" variant="outline" onClick={fetchFrameworks}>
                            Retry
                          </Button>
                        </AlertDescription>
                      </Alert>
                    ) : frameworks ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {Object.keys(frameworks[formData.frameworkCategory as keyof FrameworkCategories] || {}).map(frameworkName => (
                          <Button
                            key={frameworkName}
                            type="button"
                            variant={formData.framework === frameworkName ? "default" : "outline"}
                            className="w-full"
                            onClick={() => handleFrameworkChange(frameworkName, formData.frameworkCategory as 'backend' | 'frontend')}
                          >
                            {frameworkName}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>No frameworks available</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              {/* Build & Run Configuration */}
              <div className="space-y-6 pt-4 border-t">
                <h3 className="text-lg font-medium">Build & Run Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="installCommand">Install Command</Label>
                    <Input 
                      id="installCommand" 
                      placeholder="pip install -r requirements.txt" 
                      value={formData.installCommand} 
                      onChange={handleInputChange} 
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildCommand">Build Command</Label>
                    <Input 
                      id="buildCommand" 
                      placeholder="" 
                      value={formData.buildCommand} 
                      onChange={handleInputChange} 
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional for some frameworks
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startCommand">Start Command</Label>
                    <Input 
                      id="startCommand" 
                      placeholder="flask run" 
                      value={formData.startCommand} 
                      onChange={handleInputChange} 
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="port">Port</Label>
                    <Input 
                      id="port" 
                      placeholder="5000" 
                      value={formData.port} 
                      onChange={handleInputChange} 
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="appEntryPoint">App Entry Point</Label>
                    <Input 
                      id="appEntryPoint" 
                      placeholder="app.py" 
                      value={formData.appEntryPoint} 
                      onChange={handleInputChange} 
                      className="font-mono text-sm"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      The main file that runs your application
                    </p>
                  </div>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="space-y-6 pt-4 border-t">
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <div className="space-y-4">
                  {envVars.map((env, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input 
                          placeholder="KEY" 
                          value={env.key}
                          onChange={(e) => updateEnvVar(index, 'key', e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <div className="flex-[2]">
                        <Input 
                          placeholder="VALUE" 
                          value={env.value}
                          onChange={(e) => updateEnvVar(index, 'value', e.target.value)}
                          className="font-mono text-sm"
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeEnvVar(index)}
                        disabled={envVars.length === 1}
                        className="flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addEnvVar}
                  >
                    Add Environment Variable
                  </Button>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    Environment variables needed by your application
                  </p>
                </div>
              </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 border-t pt-6 px-4 md:px-6">
          <Button variant="outline" asChild className="w-full sm:w-auto order-2 sm:order-1">
            <Link href="/dashboard/projects">Cancel</Link>
          </Button>
          <Button 
            className="gap-2 w-full sm:w-auto order-1 sm:order-2" 
            onClick={handleSubmit} 
            disabled={isLoading || authError !== "" || !formData.framework}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            <Github className="h-4 w-4" />
            Create Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
