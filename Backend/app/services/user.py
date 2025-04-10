from repositories.user import User as UserRepository
from schemas.user_schema import UserSchema
from typing import List, Optional

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def get_or_create_user(self, user_data: dict) -> UserSchema:
        return await self.user_repository.get_or_create_user(user_data)

    async def get_user_by_id(self, user_id: str) -> UserSchema:
        return await self.user_repository.get_by_id(user_id)

    async def get_user_by_email(self, email: str) -> UserSchema:
        return await self.user_repository.get_by_email(email)

    async def get_user_by_github_id(self, github_id: str) -> UserSchema:
        return await self.user_repository.get_user_by_github_id(github_id)
    async def get_all_users(self) -> List[UserSchema]:
        return await self.user_repository.get_all()

        
    