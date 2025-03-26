from typing import List, Optional
from schemas.user_schema import User, UserCreate, UserUpdate
from pydantic import BaseModel
from abc import ABC, abstractmethod

class UserRepository(ABC):
    @abstractmethod
    async def create(self, user: UserCreate) -> User:
        pass

    @abstractmethod
    async def get_by_id(self, user_id: str) -> User:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> User:
        pass

    @abstractmethod
    async def update(self, user: UserUpdate) -> User:
        pass
