from fastapi import Depends
from services.user import UserService
from services.git_repository import GitRepositoryService
from repositories.git_repository import GitRepository
from repositories.aws_user import AWSUserRepository
from services.aws_user import AWSUserService
from dependencies.user import get_user
from dependencies.git_repository import get_git_repository
from dependencies.aws_user import get_aws_user_repository
from repositories.user import User

async def get_user_service(user_repository: User = Depends(get_user)) -> UserService:
    return UserService(user_repository)

async def get_git_repository_service(
    git_repository: GitRepository = Depends(get_git_repository)
) -> GitRepositoryService:
    return GitRepositoryService(git_repository)


async def get_aws_user_service(
    aws_user_repository: AWSUserRepository = Depends(get_aws_user_repository)
) -> AWSUserService:
    return AWSUserService(aws_user_repository)