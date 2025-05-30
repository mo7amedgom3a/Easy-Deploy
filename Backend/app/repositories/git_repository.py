from interfaces.git_repository_interface import GitRepositoryInterface
from schemas.repository import RepositorySchema
from typing import Optional
# Removed unused import
from dependencies.database_connection import DatabaseConnection
from typing import List

class GitRepository(GitRepositoryInterface):
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.collection = "repositories"

    async def save_repo(self, owner:str, repo:dict) -> dict:
        repo_data = RepositorySchema(owner=owner, **repo)
        collection = await self.db.get_collection(self.collection)
        result = await collection.insert_one(repo_data.dict())
        if result.inserted_id:
            return repo_data.dict()
        else:
            raise Exception("Failed to save repository")
    
    async def save_repositories(self, owner_id: str, repos: List[dict]) -> None:
        for repo in repos:
            repo_data = RepositorySchema(owner=owner_id, **repo)
            await self.db.save("repositories", repo_data.dict())

    async def get_repository(self, repo_name: str) -> Optional[dict]:
        query = {"name": repo_name}
        result = await self.db.find_one("repositories", query)
        return result