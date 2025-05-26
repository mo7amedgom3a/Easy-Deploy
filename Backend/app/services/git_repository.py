import os
import subprocess
from typing import List, Optional, Dict, Any, Union
import logging
import tempfile
from pathlib import Path

import httpx
from httpx import AsyncClient, HTTPStatusError

from repositories.git_repository import GitRepository
from schemas.repository import RepositorySchema
from services.user import UserService

logger = logging.getLogger('git')

class GitRepositoryService:
    """Service for interacting with Git repositories (primarily GitHub)."""
    
    def __init__(self, git_repository: GitRepository):
        self.git_repository = git_repository
        # Read from environment variable with fallbacks
        self.dir_base = "/mnt/repos"
        self.base_url = "https://api.github.com"
        self.webhook_url = "https://monkfish-feasible-heavily.ngrok-free.app/git/repository/webhook/"
        
        logger.info(f"Initializing GitRepositoryService with base directory: {self.dir_base}")
        # Ensure the base directory exists and has proper permissions
        self._ensure_base_directory()
    
    def _get_base_directory(self) -> str:
        dir_base = os.getenv("DIR_BASE")
        if dir_base:
            logger.info(f"Using configured base directory: {dir_base}")
            return dir_base
        logger.info("Using default base directory: /mnt/repos")
        return "/mnt/repos"
    
    def _ensure_base_directory(self):
        """Ensure the base directory exists and has proper permissions."""
        try:
            os.makedirs(self.dir_base, mode=0o755, exist_ok=True)
            # Test write permissions
            test_file = os.path.join(self.dir_base, ".write_test")
            with open(test_file, "w") as f:
                f.write("test")
            os.remove(test_file)
            logger.info(f"Successfully set up base directory: {self.dir_base}")
        except (PermissionError, OSError) as e:
            logger.warning(f"Failed to setup base directory {self.dir_base}: {e}")
            # Fallback to temp directory
            self.dir_base = tempfile.mkdtemp(prefix="easy_deploy_repos_")
            logger.info(f"Using temporary directory as fallback: {self.dir_base}")
        except Exception as e:
            logger.error(f"Unexpected error setting up directory: {e}")
            raise
    
    # === API Interaction Methods ===
    
    async def _make_github_request(
        self, 
        method: str, 
        endpoint: str, 
        access_token: str, 
        params: Optional[Dict[str, Any]] = None, 
        json_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make a request to the GitHub API with error handling."""
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
        try:
            async with AsyncClient() as client:
                if method.lower() == "get":
                    resp = await client.get(
                        f"{self.base_url}{endpoint}",
                        headers=headers,
                        params=params
                    )
                elif method.lower() == "post":
                    resp = await client.post(
                        f"{self.base_url}{endpoint}",
                        headers=headers,
                        params=params,
                        json=json_data
                    )
                else:
                    return {"error": f"Unsupported HTTP method: {method}"}
                    
                resp.raise_for_status()
                return resp.json()
                
        except HTTPStatusError as e:
            status_code = e.response.status_code
            error_msg = {
                404: "Resource not found or you don't have permission to access it",
                401: "Authentication failed. Please check your access token",
                403: "Forbidden. Rate limit may be exceeded or insufficient permissions",
            }.get(status_code, str(e))
            
            return {"error": error_msg}
        except Exception as e:
            return {"error": f"Request failed: {str(e)}"}

    # === Repository Information Methods ===
    
    async def fetch_user_repositories(self, owner: str, access_token: str) -> List[Dict[str, Any]]:
        """Fetch repositories for a given user."""
        params = {"per_page": 10, "sort": "created", "direction": "desc"}
        response = await self._make_github_request(
            "get", f"/users/{owner}/repos", access_token, params=params
        )
        if isinstance(response, list):
            return response
        return []

    async def fetch_repository(self, owner: str, repo_name: str, access_token: str) -> Dict[str, Any]:
        """Fetch repository details with additional information."""
        repo_data = await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}", access_token
        )
        
        if "error" in repo_data:
            return repo_data
            
        try:
            repo = RepositorySchema(**repo_data)
            if repo.name and repo.default_branch:
                latest_commit = await self.get_latest_commit(owner, repo.name, repo.default_branch, access_token)
                
                if "error" not in latest_commit:
                    repo.blob_sha = latest_commit.get("sha")
                    
                languages = await self.get_language(owner, repo.name, access_token)
                if isinstance(languages, list):
                    repo.languages = languages
                    
            return repo.dict()
        except Exception as e:
            return {"error": f"Failed to process repository data: {str(e)}"}

    async def get_language(self, owner: str, repo_name: str, access_token: str) -> Union[List[str], Dict[str, Any]]:
        """Get programming languages used in the repository."""
        languages = await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}/languages", access_token
        )
        
        if "error" in languages:
            return languages
        return list(languages.keys())

    async def get_latest_commit(self, owner: str, repo_name: str, branch: str, access_token: str) -> Dict[str, Any]:
        """Get the latest commit for a repository branch."""
        return await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}/commits/{branch}", access_token
        )

    async def get_blob_tree(self, owner: str, repo_name: str, branch: str, access_token: str, sha: str = "") -> Union[List[Dict[str, Any]], Dict[str, Any]]:
        """Get the directory tree for a repository."""
        if not sha:
            commits = await self.get_latest_commit(owner, repo_name, branch, access_token)
            if "error" in commits:
                return commits
            commit_sha = commits.get("sha")
            if not commit_sha:
                return {"error": "No SHA found in commit data"}
            sha = commit_sha
            
        tree_data = await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}/git/trees/{sha}", access_token
        )
        
        if "error" in tree_data:
            return tree_data
            
        return [item for item in tree_data.get("tree", []) if item.get("type") == "tree"]

    # === Webhook Management ===
    
    async def create_github_webhook(self, owner: str, repo_name: str, access_token: str) -> Dict[str, Any]:
        """Create a webhook for a repository."""
       
        webhook_data = {
            "config": {
                "url": self.webhook_url,
                "content_type": "json",
                "insecure_ssl": "0"
            },
            "events": ["push"]
        }
        return await self._make_github_request(
            "post", f"/repos/{owner}/{repo_name}/hooks", access_token, json_data=webhook_data
        )

    # === Local Repository Management ===
    
    async def save_repo(self, owner: str, repo: Dict[str, Any]) -> Dict[str, Any]:
        """Save repository to database."""
        try:
            repo_data = RepositorySchema(**repo)
            await self.git_repository.save_repo(owner, repo_data.dict())
            return repo_data.dict()
        except Exception as e:
            return {"error": f"Failed to save repository: {str(e)}"}
        

    async def delete_repo(self, owner: str, repo_name: str) -> dict:
        """Delete a repository from the filesystem."""
        try:
            repo_path = f"{self.dir_base}/{owner}/{repo_name}"
            if os.path.exists(repo_path):
                subprocess.run(["rm", "-rf", repo_path], check=True)
                return {"message": "Repository deleted successfully"}
            else:
                return {"error": "Repository not found"}
        except Exception as e:
            return {"error": f"Failed to delete repository: {str(e)}"}
        

    async def get_tree_directory(self, owner: str, access_token: str) -> dict:
        """Get the tree directory for owner local directory."""
        owner_dir = f"{self.dir_base}/{owner}/"
        list_dirs = os.listdir(owner_dir)
        if os.path.exists(owner_dir):
            return {"message": "Owner directory exists", "list_dirs": list_dirs}
        else:
            return {"error": "Owner directory not found"}

    async def clone_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Clone a repository to local filesystem."""
        clone_url = f"https://{access_token}@github.com/{owner}/{repo_name}.git"
        clone_dir = f"{self.dir_base}/{owner}/{repo_name}"
        
        logger.info(f"Attempting to clone repository: {owner}/{repo_name}")
        
        try:
            # Create parent directories if they don't exist
            os.makedirs(os.path.dirname(clone_dir), exist_ok=True)

            # Check if directory already exists
            if os.path.exists(clone_dir):
                logger.warning(f"Repository directory already exists at {clone_dir}")
                return {"message": "Repository directory already exists", "path": clone_dir}
            
            logger.info(f"Cloning repository to {clone_dir}")
            # Clone the repository
            result = subprocess.run(
                ["git", "clone", clone_url, clone_dir],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Set proper permissions for the cloned repository
            os.chmod(clone_dir, 0o755)
            
            logger.info(f"Successfully cloned repository to {clone_dir}")
            return {"message": "Repository cloned successfully", "path": clone_dir}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Clone failed: {e.stderr}"
            logger.error(error_msg)
            return {"error": error_msg}
        except Exception as e:
            error_msg = f"Unexpected error during clone: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}

    async def pull_repository(self, owner: str, repo_name: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        """Pull the latest changes for a cloned repository."""
        clone_dir = f"{self.dir_base}/{owner}/{repo_name}"
        
        if not os.path.exists(clone_dir):
            error_msg = f"Repository not found at {clone_dir}"
            logger.error(error_msg)
            return {"error": error_msg}
        
        try:
            original_dir = os.getcwd()
            os.chdir(clone_dir)
            
            # If access_token is provided, configure git credentials
            if access_token:
                subprocess.run(
                    ["git", "config", "credential.helper", "store"],
                    check=True,
                    capture_output=True,
                    text=True
                )
                subprocess.run(
                    ["git", "config", "credential.https://github.com.username", "x-access-token"],
                    check=True,
                    capture_output=True,
                    text=True
                )
                subprocess.run(
                    ["git", "config", "credential.https://github.com.password", access_token],
                    check=True,
                    capture_output=True,
                    text=True
                )
            
            result = subprocess.run(
                ["git", "pull"],
                check=True,
                capture_output=True,
                text=True
            )
            
            os.chdir(original_dir)
            logger.info(f"Successfully pulled repository at {clone_dir}")
            return {"message": "Repository pulled successfully", "output": result.stdout}
            
        except subprocess.CalledProcessError as e:
            error_msg = f"Pull failed: {e.stderr}"
            logger.error(error_msg)
            return {"error": error_msg}
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(error_msg)
            return {"error": error_msg}