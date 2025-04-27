import os
import subprocess
from typing import List, Optional

import httpx

from repositories.git_repository import GitRepository
from schemas.repository import RepositorySchema
from services.user import UserService


class GitRepositoryService:
    def __init__(self, git_repository: GitRepository):
        self.git_repository = git_repository


    async def fetch_user_repositories(self, owner: str, access_token: str) -> List[dict]:
        """Fetch repositories for a given user."""
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/users/{owner}/repos",
                    headers={"Authorization": f"token {access_token}"},
                    params={"per_page": 10, "sort": "created", "direction": "desc"}
                )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}


    async def get_language(self, owner: str, repo_name: str, access_token: str) -> List[str]:
        """Get programming languages used in the repository."""
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}/languages",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            return list(resp.json().keys())
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}
    

    async def get_latest_commit(self, owner: str, repo_name: str, branch: str, access_token: str) -> dict:
        """Get the latest commit for a repository branch."""
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}/commits/{branch}",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            
            if "error" in resp.json():
                return {"error": resp.json()["error"]}
            return resp.json()
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}


    async def fetch_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Fetch repository details with additional information."""
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            repo = RepositorySchema(**resp.json())
            print(repo)
            latest_commit = await self.get_latest_commit(owner, repo.name, repo.default_branch, access_token)
            repo.blob_sha = latest_commit.get("sha")
            repo.languages = await self.get_language(owner, repo.name, access_token)
            return repo.dict()
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}



    async def create_github_webhook(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Create a webhook for a repository."""
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"https://api.github.com/repos/{owner}/{repo_name}/hooks",
                    headers={
                        "Authorization": f"token {access_token}",
                        "Accept": "application/vnd.github.v3+json",
                        "X-GitHub-Api-Version": "2022-11-28"
                    },
                    json={
                        "config": {
                            "url": "https://kp6tjc7t-8000.uks1.devtunnels.ms/git/repository/github-webhook",
                            "content_type": "json",

                            "insecure_ssl": "0"
                        },
                        "events": ["push"]
                    }
                )
            resp.raise_for_status()
            print(resp.json())
            return resp.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return {"error": "Repository not found or you don't have permission to create webhooks"}
            elif e.response.status_code == 401:
                return {"error": "Authentication failed. Please check your access token"}
            return {"error": str(e)}
        except Exception as e:
            return {"error": f"Failed to create webhook: {str(e)}"}


    async def get_blob_tree(self, owner: str, repo_name: str, branch: str, access_token: str, sha: str="") -> dict:
        """Get the directory tree for a repository."""
        if not sha:
            commits = await self.get_latest_commit(owner, repo_name, branch, access_token)
            sha = commits.get("sha")
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}/git/trees/{sha}",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            return [item for item in resp.json().get("tree", []) if item.get("type") == "tree"]
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}
        
    async def save_repo(self, owner: str, repo: dict) -> dict:
        """Save repository to database."""
        repo_data = RepositorySchema(owner=owner, **repo)
        await self.git_repository.save_repo(owner, repo_data.dict())
        return repo_data.dict()
    


    async def clone_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Clone a repository to local filesystem."""
        clone_url = f"https://{access_token}@github.com/{owner}/{repo_name}.git"
        clone_dir = f"/tmp/repo/{owner}/{repo_name}"
        os.makedirs(clone_dir, exist_ok=True)
        try:
            subprocess.run(["git", "clone", clone_url, clone_dir], check=True)
            return {"message": "Repository cloned successfully", "path": clone_dir}
        except subprocess.CalledProcessError as e:
            return {"error": str(e)}
            
            

    async def pull_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        """Pull the latest changes for a cloned repository."""
        clone_url = f"https://{access_token}@github.com/{owner}/{repo_name}.git"
        clone_dir = f"/tmp/repo/{owner}/{repo_name}"
        print(clone_dir)
        if not os.path.exists(clone_dir):
            return {"error": "Repository not cloned yet"}
        
        os.chdir(clone_dir)
        try:
            subprocess.run(["git", "pull"], check=True)
            return {"message": "Repository pulled successfully"}
        except subprocess.CalledProcessError as e:
            return {"error": str(e)}