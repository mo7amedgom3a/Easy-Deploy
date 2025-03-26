from fastapi import Depends
from services.user import UserService
from dependencies.repositories import get_user_repository
from repositories.user import UserRepository

async def get_user_service(user_repository: UserRepository = Depends(get_user_repository)) -> UserService:
    return UserService(user_repository)
