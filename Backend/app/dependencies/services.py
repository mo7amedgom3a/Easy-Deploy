from fastapi import Depends
from services.user import UserService
from dependencies.user import get_user
from repositories.user import User

async def get_user_service(user_repository: User = Depends(get_user)) -> UserService:
    return UserService(user_repository)

