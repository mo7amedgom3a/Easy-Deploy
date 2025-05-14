import json
import os
import re
import shutil
from pathlib import Path
from typing import Dict

from fastapi import HTTPException
from python_terraform import Terraform
from models.deploy import Deploy
from repositories.deploy import DeployRepository
import subprocess
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
        self.project_root = Path(__file__).resolve().parent.parent.parent
        self.framework_config = self._load_framework_config()
        self.supported_frameworks = self._get_supported_frameworks()
    def _validate_path(self, path: str) -> bool:
        """Validate path to prevent directory traversal attacks."""
        normalized = os.path.normpath(path)
        return not normalized.startswith('..') and '..' not in normalized
        
    def _load_framework_config(self) -> Dict:
        """Load framework configuration from JSON file."""
        frameworks_path = Path(__file__).resolve().parent / "frameworks.json"
        if not frameworks_path.exists():
            raise FileNotFoundError("frameworks.json not found")

        try:
            with open(frameworks_path, "r") as f:
                config = json.load(f)
                return config
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON in frameworks.json")
        except Exception as e:
            raise RuntimeError(f"Error loading framework config: {str(e)}")

    def _get_supported_frameworks(self) -> set:
        """Build a set of all supported framework names."""
        return {
            key.lower() for category in self.framework_config.values()
            for key in category
        }
        
    def _get_framework_type(self, framework: str) -> str:
        """Determine if the framework is frontend or backend."""
        framework = framework.lower()
        if not framework.isalnum():
            raise ValueError("Framework name contains invalid characters")
        return "backend" if framework in self.framework_config.get("backend", {}) else "frontend"
        
    def _get_pipeline_path(self, framework: str, framework_type: str) -> str:
        """Get the appropriate pipeline path based on framework type."""
        if not self._validate_path(framework) or not self._validate_path(framework_type):
            raise ValueError("Invalid path detected")
        type_path = f"{self.base_pipeline_path}{framework_type.capitalize()}/"
        return os.path.join(type_path, framework.capitalize())
    
    def _sanitize_commands(self, command: str) -> str:
        """Sanitize build and run commands to prevent command injection."""
        if not command:
            return command
        # Only allow alphanumeric chars, spaces, dashes, dots and basic command chars
        if not re.match(r'^[a-zA-Z0-9\s\-\._/]+$', command):
            raise ValueError("Command contains invalid characters")
        return command

    def get_framework_config(self) -> Dict:
        """Get the framework configuration."""
        return self.framework_config

    async def get_aws_user(self, user_id: str) -> AWSUserSchema:
        """Fetch AWS user details from the repository."""
        if not user_id or not isinstance(user_id, str):
            raise ValueError("Invalid user ID")
        return await self.aws_user_service.get_user_by_id(user_id)

    async def create_deploy(self, deploy: DeployCreateSchema, access_token: str, user: UserSchema) -> Deploy:
        """Create a new deployment record with default or overridden configuration."""
        
        if not access_token or not isinstance(access_token, str):
            raise ValueError("Invalid access token")
        
        if not user.github_id:
            raise ValueError("User's GitHub ID is required")
            
        aws_user = await self.get_aws_user(user.github_id)
       
        if not aws_user:
            # if the first deploy, create a new user
            try:
                aws_user = await self.aws_user_service.create_user(user.github_id)
            except Exception as e:
                raise ValueError(f"Error creating AWS user: {str(e)}")
        if not aws_user:
            raise ValueError("AWS user not found or could not be created.")
       
        if not deploy.framework:
            raise ValueError("Framework is required")
            
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
        
        
        # Sanitize commands before using them
        build_command = self._sanitize_commands(deploy_data.get("build_command") or framework_defaults["build_command"])
        run_command = self._sanitize_commands(deploy_data.get("run_command") or framework_defaults["run_command"])
        
        deploy_data["build_command"] = build_command
        deploy_data["run_command"] = run_command
        deploy_data["port"] = deploy_data.get("port") or framework_defaults["port"]
        deploy_data["entry_point"] = deploy_data.get("entry_point") or framework_defaults["entry_point"]
        deploy_data["pipeline_path"] = self._get_pipeline_path(framework, framework_type)
        deploy_data["user_github_id"] = user.github_id
        deploy_data["status"] = "pending"
        deploy_data["owner"] = deploy.owner
        deploy_data["webhook_id"] = None

        # Validate the framework type and ensure it matches the provided framework.
        if framework not in self.supported_frameworks:
            raise ValueError(
                f"Unsupported framework type: {framework_type}. "
                f"Supported frameworks are: {list(self.supported_frameworks)}"
            )
            
        # Clone the repository from GitHub using the provided repo name, owner.
        try:
            # Validate owner and repo_name
            if not re.match(r'^[a-zA-Z0-9\-]+$', deploy.owner) or not re.match(r'^[a-zA-Z0-9\-_.]+$', deploy.repo_name):
                raise ValueError("Invalid repository owner or name")
                
            clone_data = await self.git_repository_service.clone_repository(
               owner=deploy.owner,
               repo_name=deploy.repo_name,
               access_token=access_token,
            )
            if "error" in clone_data:
                raise ValueError(clone_data["error"])
                
            # Handle case where root_folder_path starts with a slash
            root_path = deploy.root_folder_path.lstrip('/') if deploy.root_folder_path else ""
            
            # Validate root_path
            if not self._validate_path(root_path):
                raise ValueError("Invalid root folder path")
                
            deploy_data["absolute_path"] = os.path.join(clone_data["path"], root_path)
            
            # Copy all files from pipeline_path to absolute_path
            pipeline_source = os.path.join(self.project_root, deploy_data["pipeline_path"])
            
            # Get list of all files in pipeline directory
            pipeline_files = os.listdir(pipeline_source)
            
            # Copy each file from pipeline directory to absolute path
            for file in pipeline_files:
                source_path = os.path.join(pipeline_source, file)
                dest_path = os.path.join(deploy_data["absolute_path"], file)
                
                # Copy file or directory if it doesn't exist
                if not os.path.exists(dest_path):
                    if os.path.isfile(source_path):
                        shutil.copy(source_path, dest_path)
                    else:
                        shutil.copytree(source_path, dest_path)

            # copy terraform files from app/Pipelines/Common/Terraform to absolute_path
            terraform_path = os.path.join(self.project_root, self.base_pipeline_path, "Common", "Terraform")
            terraform_dest = os.path.join(deploy_data["absolute_path"], "terraform")
            
            # Check if terraform folder exists and remove it
            if os.path.exists(terraform_dest):
                shutil.rmtree(terraform_dest)
            shutil.copytree(terraform_path, terraform_dest)
            # create .env file in absolute_path based on deploy_data.environment_variables
            with open(os.path.join(deploy_data["absolute_path"], ".env"), "w") as f:
                for key, value in deploy_data["environment_variables"].items():
                    f.write(f"{key}={value}\n")
 
        except Exception as e:
            raise ValueError(f"Error cloning repository: {str(e)}")

        # Initialize Terraform
        try:
            tf = Terraform(working_dir=os.path.join(deploy_data["absolute_path"], "terraform", "ecs_cluster"))

            vars = {
                "user_github_id": deploy_data["user_github_id"],
                "aws_access_key": aws_user.aws_access_key_id,
                "aws_secret_access_key": aws_user.aws_secret_access_key,
                "repo_name": "my-app",
                "ecs_task_container_port": deploy_data["port"],
                "ecs_task_host_port": deploy_data["port"]
            }
            subprocess.run(["sh", "setup_backend.sh", deploy_data["user_github_id"]], cwd=os.path.join(deploy_data["absolute_path"], "terraform", "ecs_cluster"), capture_output=True, text=True)
            # apply the terraform 
            print("Applying Terraform...")
            return_code, stdout, stderr = tf.apply(skip_plan=True, var=vars, capture_output=False, auto_approve=True)
            if return_code != 0:
                raise HTTPException(status_code=500, detail="Failed to apply Terraform configuration")
            print("Getting output...")
            output = tf.output(json=True)
            print(output)
            if not output or "load_balancer_dns" not in output:
                raise ValueError("Invalid Terraform output format or missing load_balancer_dns output")
            dns_load_balancer = output["load_balancer_dns"]["value"]
        except Exception as e:
            raise ValueError(f"Error initializing or applying Terraform: {str(e)}")
        
        deploy_data["load_balancer_url"] = dns_load_balancer
        print(deploy_data)
        # Create a new DeployCreateSchema from the deploy data
        
        
        # Create the deploy in the repository
        return await self.deploy_repository.create_deploy(deploy_data)