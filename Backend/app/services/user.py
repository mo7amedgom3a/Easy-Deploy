from repositories.user import UserRepository
from schemas.user_schema import User, UserCreate, UserUpdate
from typing import List, Optional

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def create_user(self, user: UserCreate) -> User:
        return await self.user_repository.create(user)

    async def get_user_by_id(self, user_id: str) -> User:
        return await self.user_repository.get_by_id(user_id)

    async def get_user_by_email(self, email: str) -> User:
        return await self.user_repository.get_by_email(email)

    async def update_user(self, user: UserUpdate) -> User:
        return await self.user_repository.update(user)
        
    