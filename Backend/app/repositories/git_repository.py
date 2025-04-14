from interfaces.git_repository_interface import GitRepositoryInterface
from schemas.repository import RepositorySchema
from typing import Optional
# Removed unused import
from dependencies.database_connection import DatabaseConnection

class GitRepository(GitRepositoryInterface):
    def __init__(self, db: DatabaseConnection):
        self.db = db

    async def save_repositories(self, owner_id: str, repos: list[dict])-> None:
        """
        Save a list of repositories for a given owner.
        """
        await self.collection.delete_many({"owner_id": owner_id})
        for repo in repos:
            repo_doc = {
                "github_id": repo["id"],
                "owner_id": owner_id,
                "name": repo["name"],
                "full_name": repo["full_name"],
                "private": repo["private"],
                "html_url": repo["html_url"],
                "description": repo.get("description"),
                "language": repo.get("language"),
            }
            await self.collection.insert_one(repo_doc)
        return None

    async def get_repository(self, repo_name: str) -> Optional[dict]:
        """
        Get a repository by its name.
        """
        repo = await self.collection.find_one({"name": repo_name})
        if repo:
            return dict(repo)
        return None
