"use client"

import { useState, useEffect } from "react"
import { Folder, File, ChevronRight, ChevronDown, Loader2, RefreshCw, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { API_URL } from "@/lib/constants"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DirectoryInfo {
  path: string
  sha: string
  type?: string
  name?: string
  children?: DirectoryInfo[]
}

interface DirectorySelectorProps {
  owner: string
  repoName: string
  onDirectorySelected: (directory: DirectoryInfo) => void
}

export const DirectorySelector = ({
  owner,
  repoName,
  onDirectorySelected
}: DirectorySelectorProps) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [structure, setStructure] = useState<DirectoryInfo | null>(null)
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set())
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryInfo | null>(null)
  const [repoInfo, setRepoInfo] = useState<any>(null)
  const [branch, setBranch] = useState<string>("main")
  const [loadingSubdirectory, setLoadingSubdirectory] = useState<string | null>(null)

  useEffect(() => {
    console.log(`DirectorySelector mounted with owner=${owner}, repoName=${repoName}`);
    
    // Create a default root directory if nothing is selected
    if (!selectedDirectory) {
      console.log("No directory selected, initializing with root directory");
      const rootDir: DirectoryInfo = {
        path: "/",
        name: "Root",
        sha: "root",
        type: "dir",
        children: []
      };
      setSelectedDirectory(rootDir);
      onDirectorySelected(rootDir);
    }
    
    // Only fetch repo info if not using a default root directory
    fetchRepoInfo();
  }, [owner, repoName]);

  const fetchRepoInfo = async () => {
    if (!owner || !repoName) {
      console.log("Missing owner or repoName, cannot fetch repository info");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching repository info for ${owner}/${repoName}`);
      
      // First get the repository info which contains the blob_sha
      const repoResponse = await fetch(`/api/repository/github/${owner}/${repoName}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      });

      if (!repoResponse.ok) {
        const errorData = await repoResponse.json();
        throw new Error(errorData.error || `Failed to fetch repository info: ${repoResponse.statusText}`);
      }

      const repoData = await repoResponse.json();
      console.log("Repository info:", repoData);
      setRepoInfo(repoData);
      
      if (repoData.default_branch) {
        setBranch(repoData.default_branch);
      }

      // If the blob_sha is null, we need to get the default branch sha
      let rootSha = repoData.blob_sha;
      
      if (!rootSha) {
        console.log("No blob_sha found in repository data, fetching default branch SHA");
        // Need to fetch the default branch reference to get its SHA
        try {
          // Get a token for the API request
          const tokenResponse = await fetch('/api/auth/token', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
            cache: 'no-store'
          });
          
          let token = null;
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            token = tokenData.token;
          }
          
          if (!token) {
            throw new Error("Failed to get authentication token");
          }
          
          // Fetch the branch directly from the GitHub API
          const branchResponse = await fetch(`${API_URL}/git/repository/${owner}/${repoName}/refs/heads/${repoData.default_branch || 'main'}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!branchResponse.ok) {
            throw new Error(`Failed to fetch branch reference: ${branchResponse.statusText}`);
          }
          
          const branchData = await branchResponse.json();
          console.log("Branch reference data:", branchData);
          
          if (branchData && branchData.object && branchData.object.sha) {
            rootSha = branchData.object.sha;
            console.log("Using branch SHA as root:", rootSha);
          } else {
            // If we still don't have a SHA, create a fake one for the root directory
            rootSha = "root";
            console.log("Using placeholder root SHA");
          }
        } catch (branchError) {
          console.error("Error fetching branch reference:", branchError);
          // Create a fake SHA for the root directory
          rootSha = "root";
          console.log("Using placeholder root SHA due to error");
        }
      }

      // If we have a SHA now, fetch the directory structure
      if (rootSha) {
        await fetchDirectoryStructure(rootSha);
      } else {
        // If we still don't have a SHA, create a root node with an empty directory
        const rootPath = "/";
        const rootNode: DirectoryInfo = {
          path: rootPath,
          name: repoName,
          sha: "root",
          type: "dir",
          children: [],
        };
        
        setStructure(rootNode);
        setSelectedDirectory(rootNode);
        onDirectorySelected(rootNode);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching repository info:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  const fetchDirectoryStructure = async (rootSha: string) => {
    if (!owner || !repoName || !rootSha) {
      // Even if parameters are missing, create a root node
      const rootPath = "/";
      const rootNode: DirectoryInfo = {
        path: rootPath,
        name: repoName || "Root",
        sha: "root",
        type: "dir",
        children: [],
      };
      
      setStructure(rootNode);
      setSelectedDirectory(rootNode);
      onDirectorySelected(rootNode);
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching directory structure for ${owner}/${repoName} with SHA ${rootSha}`);
      
      // If rootSha is our placeholder, create an empty root directory
      if (rootSha === "root") {
        const rootPath = "/";
        const rootNode: DirectoryInfo = {
          path: rootPath,
          name: repoName,
          sha: rootSha,
          type: "dir",
          children: [],
        };
        
        setStructure(rootNode);
        setSelectedDirectory(rootNode);
        onDirectorySelected(rootNode);
        setLoading(false);
        return;
      }
      
      // Get the directory structure using the blob_sha from repo info
      let retries = 0;
      const maxRetries = 3;
      let blobsData = null;
      
      while (retries < maxRetries) {
        try {
          console.log(`Attempt ${retries + 1} to fetch blobs for ${owner}/${repoName}`);
          const blobsResponse = await fetch(
            `/api/repository/github/${owner}/${repoName}/blobs/${branch}/${rootSha}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              cache: 'no-store'
            }
          );

          if (blobsResponse.ok) {
            const responseData = await blobsResponse.json();
            console.log("Directory structure data:", responseData);
            blobsData = responseData;
            break; // Success, exit the retry loop
          } else {
            console.error(`Attempt ${retries + 1} failed with status: ${blobsResponse.status}`);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
          }
        } catch (error) {
          console.error(`Error on attempt ${retries + 1}:`, error);
          retries++;
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // If we couldn't get blob data after retries, use empty root
      if (!blobsData) {
        console.warn("Could not fetch directory structure after retries, using empty root");
        const rootPath = "/";
        const rootNode: DirectoryInfo = {
          path: rootPath,
          name: repoName,
          sha: rootSha,
          type: "dir",
          children: [],
        };
        
        setStructure(rootNode);
        setSelectedDirectory(rootNode);
        onDirectorySelected(rootNode);
        setLoading(false);
        return;
      }

      // Create the root node
      const rootPath = "/";
      const rootNode: DirectoryInfo = {
        path: rootPath,
        name: repoName,
        sha: rootSha,
        type: "dir",
        children: [],
      };

      // Process each item and add it to the tree
      if (Array.isArray(blobsData)) {
        console.log(`Processing ${blobsData.length} items from blob data`);
        blobsData.forEach((item: any) => {
          if (item.type === "tree") { // GitHub API uses "tree" for directories
            const dirPath = item.path || "";
            const dirName = dirPath.split("/").pop() || dirPath;
            
            console.log(`Adding directory: ${dirName} (${dirPath})`);
            const dirNode: DirectoryInfo = {
              path: dirPath,
              name: dirName,
              sha: item.sha,
              type: "dir",
              children: []
            };
            
            rootNode.children?.push(dirNode);
          }
        });

        // Sort directories alphabetically
        rootNode.children?.sort((a, b) => {
          return (a.name || "").localeCompare(b.name || "");
        });
        
        console.log(`Root node has ${rootNode.children?.length || 0} child directories`);
      } else {
        console.warn("Blob data is not an array, using empty root");
      }

      setStructure(rootNode);
      // Select the root directory by default
      setSelectedDirectory(rootNode);
      onDirectorySelected(rootNode);
    } catch (err) {
      console.error("Error fetching directory structure:", err);
      
      // Create a root directory node even if there's an error
      const rootPath = "/";
      const rootNode: DirectoryInfo = {
        path: rootPath,
        name: repoName,
        sha: rootSha,
        type: "dir",
        children: [],
      };
      
      setStructure(rootNode);
      setSelectedDirectory(rootNode);
      onDirectorySelected(rootNode);
      
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubdirectories = async (directoryPath: string, directorySha: string) => {
    if (!owner || !repoName) return;
    
    setLoadingSubdirectory(directoryPath);
    
    try {
      console.log(`Fetching subdirectories for ${directoryPath} with SHA ${directorySha}`);
      
      // If using the placeholder SHA, don't try to fetch subdirectories
      if (directorySha === "root") {
        console.log("Using placeholder SHA, not fetching subdirectories");
        setLoadingSubdirectory(null);
        return;
      }
      
      // Get subdirectories for an expanded directory
      const subdirResponse = await fetch(
        `/api/repository/github/${owner}/${repoName}/blobs/${branch}/${directorySha}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: 'no-store'
        }
      );

      if (!subdirResponse.ok) {
        const errorData = await subdirResponse.json();
        throw new Error(errorData.error || `Failed to fetch subdirectories: ${subdirResponse.statusText}`);
      }

      const subdirData = await subdirResponse.json();
      console.log(`Subdirectory data for ${directoryPath}:`, subdirData);
      
      // Update the structure with the subdirectories
      const newStructure = {...structure};
      const updateNode = (node: DirectoryInfo): boolean => {
        if (node.path === directoryPath) {
          // This is the node we want to update
          node.children = [];
          
          if (Array.isArray(subdirData)) {
            subdirData.forEach((item: any) => {
              if (item.type === "tree") { // GitHub API uses "tree" for directories
                const dirPath = item.path || '';
                // Handle nested paths correctly
                const dirName = dirPath.split("/").pop() || dirPath;
                
                node.children?.push({
                  path: dirPath,
                  name: dirName,
                  sha: item.sha || '',
                  type: "dir",
                  children: []
                });
              }
            });
            
            // Sort directories alphabetically
            node.children?.sort((a, b) => {
              return (a.name || "").localeCompare(b.name || "");
            });
          }
          
          return true;
        } else if (node.children) {
          // Check children recursively
          for (const child of node.children) {
            if (updateNode(child)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      if (newStructure) {
        updateNode(newStructure as DirectoryInfo);
        setStructure(newStructure as DirectoryInfo);
      }
    } catch (error) {
      console.error("Error fetching subdirectories:", error);
    } finally {
      setLoadingSubdirectory(null);
    }
  };

  const toggleDirectory = async (path: string, sha: string) => {
    console.log(`Toggling directory: ${path} with SHA: ${sha}`);
    const isExpanded = expandedPaths.has(path);
    
    if (!isExpanded) {
      // If we're expanding a directory, fetch its subdirectories
      await fetchSubdirectories(path, sha);
    }
    
    setExpandedPaths((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleSelectDirectory = (directory: DirectoryInfo) => {
    console.log(`Selected directory: ${directory.path}`);
    setSelectedDirectory(directory);
    onDirectorySelected(directory);
  };

  const renderTree = (node: DirectoryInfo, level = 0) => {
    const isExpanded = expandedPaths.has(node.path);
    const isSelected = selectedDirectory?.path === node.path;
    const hasChildren = node.children && node.children.length > 0;
    const isLoading = loadingSubdirectory === node.path;
    
    return (
      <div key={node.path} className="select-none">
        <div
          className={`flex items-center py-1 px-2 rounded-md ${isSelected ? "bg-primary/10" : "hover:bg-muted"}`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div
            className="flex items-center cursor-pointer"
            onClick={() => toggleDirectory(node.path, node.sha)}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-muted-foreground" />
            ) : (
              <>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 mr-2 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
              </>
            )}
          </div>
          <div
            className="flex items-center flex-1 cursor-pointer"
            onClick={() => handleSelectDirectory(node)}
          >
            <Folder className={`h-4 w-4 mr-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
            <span className={isSelected ? "font-medium text-primary" : ""}>{node.name}</span>
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-2">
            {node.children?.map((child) => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleRetry = () => {
    fetchRepoInfo();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading directory structure for {owner}/{repoName}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-3">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-2">
                <RefreshCw className="h-3 w-3 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
          
          {/* Even with an error, show at least the root directory option */}
          <div className="mt-3 border rounded-md p-2">
            <div 
              className="flex items-center py-1 px-2 rounded-md bg-primary/10 cursor-pointer"
              onClick={() => {
                const rootDir = {
                  path: "/",
                  name: "Root",
                  sha: "root",
                  type: "dir",
                  children: []
                };
                handleSelectDirectory(rootDir);
              }}
            >
              <Folder className="h-4 w-4 mr-2 text-primary" />
              <span className="font-medium text-primary">/ (root)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-3">
        <div className="text-sm font-medium mb-2 flex items-center justify-between">
          <div>Repository Structure {owner && repoName ? `(${owner}/${repoName})` : ""}</div>
          {selectedDirectory && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>Path: {selectedDirectory.path}</span>
              <span>Branch: {branch}</span>
            </div>
          )}
        </div>
        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-2">
            {structure ? (
              renderTree(structure)
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No directory structure available
              </div>
            )}
          </div>
        </ScrollArea>
        {selectedDirectory && (
          <div className="text-xs text-muted-foreground mt-2">
            Selected: {selectedDirectory.path === "/" ? "/ (root)" : selectedDirectory.path}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 