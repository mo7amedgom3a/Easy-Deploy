from typing import List, Optional
from schemas.repository import RepositorySchema
from pydantic import BaseModel

from abc import ABC, abstractmethod

class GitRepositoryInterface(ABC):
    @abstractmethod
    async def save_repositories(owner_id: str, repos: List[dict]) -> None:
        pass
    @abstractmethod
    async def get_repository(repo_name: str) -> Optional[dict]:
        pass
