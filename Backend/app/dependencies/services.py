from fastapi import Depends
from services.user import UserService
from services.git_repository import GitRepositoryService
from repositories.git_repository import GitRepository
from dependencies.user import get_user
from dependencies.git_repository import get_git_repository
from repositories.user import User

async def get_user_service(user_repository: User = Depends(get_user)) -> UserService:
    return UserService(user_repository)

async def get_git_repository_service(
    git_repository: GitRepository = Depends(get_git_repository)
) -> GitRepositoryService:
    return GitRepositoryService(git_repository)