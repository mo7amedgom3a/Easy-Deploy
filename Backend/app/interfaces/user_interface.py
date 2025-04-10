from typing import List, Optional
from schemas.user_schema import UserSchema
from pydantic import BaseModel
from abc import ABC, abstractmethod

class UserInterface(ABC):
    @abstractmethod


    async def get_by_id(self, user_id: str) -> UserSchema:
        pass

    @abstractmethod
    async def get_by_email(self, email: str) -> UserSchema:
        pass

    async def get_or_create_user(self, user_data: dict) -> UserSchema:
        pass

    async def get_all(self) -> List[UserSchema]:
        pass
