import os
import subprocess
from typing import List, Optional, Dict, Any

import httpx
from httpx import AsyncClient, HTTPStatusError

from repositories.git_repository import GitRepository
from schemas.repository import RepositorySchema
from services.user import UserService


class GitRepositoryService:
    """Service for interacting with Git repositories (primarily GitHub)."""
    
    def __init__(self, git_repository: GitRepository):
        self.git_repository = git_repository
        self.dir_base = "/mnt/repos" # change in production 
        self.base_url = "https://api.github.com"
        self.webhook_url = "https://kp6tjc7t-8000.uks1.devtunnels.ms//git/repository/github-webhook"
        
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
    
    async def fetch_user_repositories(self, owner: str, access_token: str) -> List[dict]:
        """Fetch repositories for a given user."""
        params = {"per_page": 10, "sort": "created", "direction": "desc"}
        return await self._make_github_request(
            "get", f"/users/{owner}/repos", access_token, params=params
        )

    async def fetch_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Fetch repository details with additional information."""
        repo_data = await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}", access_token
        )
        
        if "error" in repo_data:
            return repo_data
            
        try:
            repo = RepositorySchema(**repo_data)
            latest_commit = await self.get_latest_commit(owner, repo.name, repo.default_branch, access_token)
            
            if "error" not in latest_commit:
                repo.blob_sha = latest_commit.get("sha")
                
            languages = await self.get_language(owner, repo.name, access_token)
            if isinstance(languages, list):
                repo.languages = languages
                
            return repo.dict()
        except Exception as e:
            return {"error": f"Failed to process repository data: {str(e)}"}

    async def get_language(self, owner: str, repo_name: str, access_token: str) -> List[str]:
        """Get programming languages used in the repository."""
        languages = await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}/languages", access_token
        )
        
        if "error" in languages:
            return languages
        return list(languages.keys())

    async def get_latest_commit(self, owner: str, repo_name: str, branch: str, access_token: str) -> dict:
        """Get the latest commit for a repository branch."""
        return await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}/commits/{branch}", access_token
        )

    async def get_blob_tree(self, owner: str, repo_name: str, branch: str, access_token: str, sha: str = "") -> dict:
        """Get the directory tree for a repository."""
        if not sha:
            commits = await self.get_latest_commit(owner, repo_name, branch, access_token)
            if "error" in commits:
                return commits
            sha = commits.get("sha")
            
        tree_data = await self._make_github_request(
            "get", f"/repos/{owner}/{repo_name}/git/trees/{sha}", access_token
        )
        
        if "error" in tree_data:
            return tree_data
            
        return [item for item in tree_data.get("tree", []) if item.get("type") == "tree"]

        pass

    # === Webhook Management ===
    
    async def create_github_webhook(self, owner: str, repo_name: str, access_token: str) -> dict:
        
        """Create a webhook for a repository."""
        print("access_token", access_token)
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
    
    async def save_repo(self, owner: str, repo: dict) -> dict:
        """Save repository to database."""
        try:
            repo_data = RepositorySchema(owner=owner, **repo)
            await self.git_repository.save_repo(owner, repo_data.dict())
            return repo_data.dict()
        except Exception as e:
            return {"error": f"Failed to save repository: {str(e)}"}

    async def clone_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Clone a repository to local filesystem."""
        clone_url = f"https://{access_token}@github.com/{owner}/{repo_name}.git"
        clone_dir = f"{self.dir_base}/{owner}/{repo_name}"
        os.makedirs(clone_dir, exist_ok=True)
        
        try:
            subprocess.run(["git", "clone", clone_url, clone_dir], check=True)
            return {"message": "Repository cloned successfully", "path": clone_dir}
        except subprocess.CalledProcessError as e:
            return {"error": f"Clone failed: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error during clone: {str(e)}"}

    async def pull_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Pull the latest changes for a cloned repository."""
        clone_dir = f"/tmp/repo/{owner}/{repo_name}"
        
        if not os.path.exists(clone_dir):
            return {"error": "Repository not cloned yet"}
        
        try:
            original_dir = os.getcwd()
            os.chdir(clone_dir)
            subprocess.run(["git", "pull"], check=True)
            os.chdir(original_dir)
            return {"message": "Repository pulled successfully"}
        except subprocess.CalledProcessError as e:
            return {"error": f"Pull failed: {str(e)}"}
        except Exception as e:
            return {"error": f"Unexpected error: {str(e)}"}