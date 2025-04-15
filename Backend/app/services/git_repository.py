from repositories.git_repository import GitRepository
from schemas.repository import RepositorySchema
from services.user import UserService
from typing import List
from typing import Optional
import httpx


class GitRepositoryService:
    def __init__(self, git_repository: GitRepository):
        self.git_repository = git_repository

    async def fetch_user_repositories(self, owner: str, access_token: str) -> List[dict]:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/users/{owner}/repos",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}
    
    
    async def fetch_repository(self, owner: str, repo_name: str, access_token: str) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}
        

    async def get_latest_commit(self, owner: str, repo_name: str, branch:str, access_token: str) -> dict:
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo_name}/commits/{branch}",
                    headers={"Authorization": f"token {access_token}"}
                )
            resp.raise_for_status()
            print(resp.json())
            if "error" in resp.json():
                return {"error": resp.json()["error"]}
            return resp.json()
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}


    async def get_blob_tree(self, owner, repo_name, branch, access_token, sha: str="") -> dict:
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
            # return if type = tree or blob
            return [item for item in resp.json().get("tree", []) if item.get("type") == "tree"]
        except httpx.HTTPStatusError as e:
            return {"error": str(e)}
        
    async def save_repo(self, owner:str, repo:dict) -> dict:
        repo_data = RepositorySchema(owner=owner, **repo)
        await self.git_repository.save_repo(owner, repo_data.dict())
        return repo_data.dict()
