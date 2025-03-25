from repositories.user import UserRepository
from models.user import User
from typing import List, Optional

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def create_user(self, user: User) -> User:
        return await self.user_repository.create(user)

    async def get_user_by_id(self, user_id: str) -> User:
        return await self.user_repository.get_by_id(user_id)

    async def get_all_users(self) -> List[User]:
        return await self.user_repository.get_all()
