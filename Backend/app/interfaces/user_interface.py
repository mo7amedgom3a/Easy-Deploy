from typing import List, Optional
from models.user import User
from abc import ABC, abstractmethod

class UserRepository:
    @abstractmethod
    async def create(self, user: User) -> User:
        pass
    
    @abstractmethod
    async def get_by_id(self, user_id: str) -> User:
        pass

    @abstractmethod
    async def get_all(self) -> List[User]:
        pass
