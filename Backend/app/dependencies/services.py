from fastapi import Depends
from services.user import UserService
from services.git_repository import GitRepositoryService
from repositories.git_repository import GitRepository
from repositories.aws_user import AWSUserRepository
from repositories.deploy import DeployRepository
from services.deploy import DeployService
from services.monitoring import MonitoringService
from services.aws_user import AWSUserService
from dependencies.user import get_user
from dependencies.git_repository import get_git_repository
from dependencies.aws_user import get_aws_user_repository
from dependencies.deploy import get_deploy_repository


from dependencies.user import get_user
from repositories.user import User
from services.aws_codebuild import AWSCodeBuild

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


async def get_deploy_service(
    deploy_repository: DeployRepository = Depends(get_deploy_repository),
    aws_user_service: AWSUserService = Depends(get_aws_user_service),
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
) -> DeployService:
    return DeployService(deploy_repository, aws_user_service, git_repository_service)


async def get_aws_codebuild(
    
) -> AWSCodeBuild:
    return AWSCodeBuild()


async def get_monitoring_service(
    
) -> MonitoringService:
    return MonitoringService()

