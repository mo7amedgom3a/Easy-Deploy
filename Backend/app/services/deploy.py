import json
import os
from pathlib import Path
from typing import Dict

from models.deploy import Deploy
from repositories.deploy import DeployRepository
from schemas.deploy_schema import DeployCreateSchema
from schemas.aws_user_schema import AWSUserSchema
from schemas.user_schema import UserSchema
from services.aws_user import AWSUserService
from services.git_repository import GitRepositoryService

class DeployService:
    def __init__(self, deploy_repository: DeployRepository, aws_user_service: AWSUserService, git_repository_service: GitRepositoryService):
        """Initialize DeployService with repository and service dependencies."""
        self.deploy_repository = deploy_repository
        self.aws_user_service = aws_user_service
        self.git_repository_service = git_repository_service
        self.base_pipeline_path = "app/Pipelines/"
        self.framework_config = self._load_framework_config()
        self.supported_frameworks = self._get_supported_frameworks()
        
    def _load_framework_config(self) -> Dict:
        """Load framework configuration from JSON file."""
        frameworks_path = Path(__file__).resolve().parent / "frameworks.json"
        if not frameworks_path.exists():
            raise FileNotFoundError("frameworks.json not found")

        with open(frameworks_path, "r") as f:
            config = json.load(f)
            return config

    def _get_supported_frameworks(self) -> set:
        """Build a set of all supported framework names."""
        return {
            key for category in self.framework_config.values()
            for key in category
        }
        
    def _get_framework_type(self, framework: str) -> str:
        """Determine if the framework is frontend or backend."""
        return "backend" if framework in self.framework_config.get("backend", {}) else "frontend"
        
    def _get_pipeline_path(self, framework: str, framework_type: str) -> str:
        """Get the appropriate pipeline path based on framework type."""
        type_path = f"{self.base_pipeline_path}{framework_type.capitalize()}/"
        return os.path.join(type_path, framework.capitalize())
    


    def get_framework_config(self) -> Dict:
        """Get the framework configuration."""
        return self.framework_config


    async def get_aws_user(self, user_id: str) -> AWSUserSchema:
        """Fetch AWS user details from the repository."""
        return await self.aws_user_service.get_user_by_id(user_id)


    async def create_deploy(self, deploy: DeployCreateSchema, access_token: str, user: UserSchema) -> Deploy:
        """Create a new deployment record with default or overridden configuration."""
        aws_user = await self.get_aws_user(user.github_id)
        if not aws_user:
            # if the first deploy, create a new user
            try:
                aws_user = await self.aws_user_service.create_user(user.github_id)
            except Exception as e:
                raise ValueError(f"Error creating AWS user: {str(e)}")
        if not aws_user:
            raise ValueError("AWS user not found or could not be created.")
       
        framework = deploy.framework.lower()
        framework_type = self._get_framework_type(framework)

        framework_defaults = self.framework_config.get(framework_type, {}).get(framework)
        if not framework_defaults:
            raise ValueError(
                f"Unsupported framework: {framework}. "
                f"Supported frameworks are: {list(self.supported_frameworks)}"
            )

        # Merge user input with defaults (user input overrides defaults if provided)
        deploy_data = deploy.dict(exclude_unset=True)
        deploy_data["build_command"] = deploy_data.get("build_command") or framework_defaults["build_command"]
        deploy_data["run_command"] = deploy_data.get("run_command") or framework_defaults["run_command"]
        deploy_data["port"] = deploy_data.get("port") or framework_defaults["port"]
        deploy_data["entry_point"] = deploy_data.get("entry_point") or framework_defaults["entry_point"]
        deploy_data["pipeline_path"] = self._get_pipeline_path(framework, framework_type)
        deploy_data["user_github_id"] = user.github_id
        deploy_data["status"] = "pending"
        deploy_data["webhook_id"] = None
        """
        TODO:

        - copy the pipeline file to the local path with the framework selected.
        - copy infrastructure files to the local path.
        - run terraform init and apply.
        """
        # Validate the framework type and ensure it matches the provided framework.
        if framework not in self.supported_frameworks:
            raise ValueError(
                f"Unsupported framework type: {framework_type}. "
                f"Supported frameworks are: {list(self.supported_frameworks)}"
            )
        # Clone the repository from GitHub using the provided repo name, owner.
        try:
            clone_data = await self.git_repository_service.clone_repository(
               owner=deploy.owner,
               repo_name=deploy.repo_name,
                access_token=access_token,
            )
            if "error" in clone_data:
                raise ValueError(clone_data["error"])
            # Handle case where root_folder_path starts with a slash
            root_path = deploy.root_folder_path.lstrip('/') if deploy.root_folder_path else ""
            deploy_data["absolute_path"] = os.path.join(clone_data["path"], root_path)
        
        except Exception as e:
            raise ValueError(f"Error cloning repository: {str(e)}")


        return await self.deploy_repository.create_deploy(Deploy(**deploy_data))