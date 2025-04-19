from repositories.aws_user import AWSUserRepository
from models.aws_user import AWSUser
from schemas.aws_user_schema import AWSUserSchema
from models.aws_user import AWSUser
from typing import List, Optional
from fastapi import HTTPException
import httpx
import os
from dotenv import load_dotenv

class AWSUserService:
    def __init__(self, aws_user: AWSUserRepository):
        self.aws_user = aws_user
        load_dotenv()

    async def get_all_users(self) -> List[AWSUserSchema]:
        users = await self.aws_user.get_all_users()
        return users

    async def get_user_by_id(self, user_id: str) -> AWSUserSchema:
        user = await self.aws_user.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return AWSUserSchema.from_orm(user)

    async def create_user(self, user: AWSUser) -> AWSUserSchema:
        created_user = await self.aws_user.create_user(user)
        return AWSUserSchema.from_orm(created_user)

    async def update_user(self, user_id: str, user: AWSUser) -> Optional[AWSUserSchema]:
        existing_user = await self.aws_user.get_user(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        updated_user = await self.aws_user.update_user(user)
        return AWSUserSchema.from_orm(updated_user)

    async def delete_user(self, user_id: str) -> bool:
        existing_user = await self.aws_user.get_user(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        return await self.aws_user.delete_user(existing_user.user_github_id)