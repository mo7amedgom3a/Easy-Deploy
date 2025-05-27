import json
import os
import re
import shutil
from pathlib import Path
from typing import Dict
import logging
from datetime import datetime

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
from services.aws_codebuild import AWSCodeBuild

logger = logging.getLogger('deploy')

class DeployService:
    def __init__(self, deploy_repository: DeployRepository, aws_user_service: AWSUserService, git_repository_service: GitRepositoryService):
        """Initialize DeployService with repository and service dependencies."""
        self.deploy_repository = deploy_repository
        self.aws_user_service = aws_user_service
        self.git_repository_service = git_repository_service
        self.base_pipeline_path = "app/Pipelines/"
        self.project_root = Path(__file__).resolve().parent.parent.parent
        self.codebuild_service = AWSCodeBuild()
        self.framework_config = self._load_framework_config()
        self.supported_frameworks = self._get_supported_frameworks()
        logger.info("DeployService initialized successfully")
    def _validate_path(self, path: str) -> bool:
        """Validate path to prevent directory traversal attacks."""
        normalized = os.path.normpath(path)
        return not normalized.startswith('..') and '..' not in normalized
        
    def _load_framework_config(self) -> Dict:
        """Load framework configuration from JSON file."""
        frameworks_path = Path(__file__).resolve().parent / "frameworks.json"
        if not frameworks_path.exists():
            logger.error("frameworks.json not found")
            raise FileNotFoundError("frameworks.json not found")

        try:
            with open(frameworks_path, "r") as f:
                config = json.load(f)
                logger.info("Successfully loaded framework configuration")
                return config
        except json.JSONDecodeError:
            logger.error("Invalid JSON in frameworks.json")
            raise ValueError("Invalid JSON in frameworks.json")
        except Exception as e:
            logger.error(f"Error loading framework config: {str(e)}")
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

    async def get_deploy(self, repo_name: str, owner: str) -> Deploy:
        """Fetch a deployment record from the repository."""
        if not repo_name or not isinstance(repo_name, str):
            raise ValueError("Invalid repo name")
        if not owner or not isinstance(owner, str):
            raise ValueError("Invalid owner")
        deploy = await self.deploy_repository.get_deploy(repo_name, owner)
        if not deploy:
            raise ValueError(f"Deployment not found for {owner}/{repo_name}")
        return deploy
    
    async def destroy_terraform_resources(self, owner: str, repo_name: str) -> Dict[str, str]:
        """Destroy Terraform resources for a given repository."""
        try:
            # Get the deploy record
            deploy = await self.get_deploy(repo_name, owner)
            if not deploy or not deploy.absolute_path:
                raise ValueError("Deploy record not found or missing absolute path")
            # get the absolute path of the deploy
            tf_working_dir = os.path.join(str(deploy.absolute_path), "terraform", "ecs_cluster")
            tf = Terraform(working_dir=tf_working_dir)
            tf.destroy(auto_approve=True, var={'github_owner': deploy.owner})
            return {"status": "success", "message": "Resources destroyed successfully"}
        except Exception as e:
            raise ValueError(f"Error destroying Terraform resources: {str(e)}")
        
        
    async def create_deploy(self, deploy: DeployCreateSchema, access_token: str, user: UserSchema) -> Deploy:
        """Create a new deployment record with default or overridden configuration."""
        logger.info(f"Starting deployment process for repository: {deploy.owner}/{deploy.repo_name}")
        
        # Generate unique tag for this deployment
        deployment_tag = "latest"
        
        if not access_token or not isinstance(access_token, str):
            logger.error("Invalid access token provided")
            raise ValueError("Invalid access token")
        
        if not user.github_id:
            logger.error("User's GitHub ID is required")
            raise ValueError("User's GitHub ID is required")
        aws_user = await self.get_aws_user(user.github_id)
        if not aws_user:
            logger.info(f"Creating new AWS user for GitHub ID: {user.github_id}")
            try:
                aws_user = await self.aws_user_service.create_user(user.github_id)
            except Exception as e:
                logger.error(f"Error creating AWS user: {str(e)}")
                raise ValueError(f"Error creating AWS user: {str(e)}")
        if not aws_user:
            logger.error("AWS user not found or could not be created")
            raise ValueError("AWS user not found or could not be created.")
       
        if not deploy.framework:
            logger.error("Framework is required")
            raise ValueError("Framework is required")
            
        framework = deploy.framework.lower()
        framework_type = self._get_framework_type(framework)

        framework_defaults = self.framework_config.get(framework_type, {}).get(framework)
        if not framework_defaults:
            logger.error(f"Unsupported framework: {framework}")
            raise ValueError(
                f"Unsupported framework: {framework}. "
                f"Supported frameworks are: {list(self.supported_frameworks)}"
            )

        # Merge user input with defaults
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

        logger.info(f"Deployment configuration prepared for {deploy.owner}/{deploy.repo_name}")

        # Clone the repository
        try:
            if not re.match(r'^[a-zA-Z0-9\-]+$', deploy.owner) or not re.match(r'^[a-zA-Z0-9\-_.]+$', deploy.repo_name):
                logger.error("Invalid repository owner or name")
                raise ValueError("Invalid repository owner or name")
                
            logger.info(f"Cloning repository: {deploy.owner}/{deploy.repo_name}")
            clone_data = await self.git_repository_service.clone_repository(
               owner=deploy.owner,
               repo_name=deploy.repo_name,
               access_token=access_token,
            )
            if "error" in clone_data:
                logger.error(f"Repository clone failed: {clone_data['error']}")
                raise ValueError(clone_data["error"])
                
            root_path = deploy.root_folder_path.lstrip('/') if deploy.root_folder_path else ""
            
            if not self._validate_path(root_path):
                logger.error("Invalid root folder path")
                raise ValueError("Invalid root folder path")
                
            deploy_data["absolute_path"] = os.path.join(clone_data["path"], root_path)
            
            # Copy pipeline files
            pipeline_source = os.path.join(self.project_root, deploy_data["pipeline_path"])
            logger.info(f"Copying pipeline files from {pipeline_source}")
            
            pipeline_files = os.listdir(pipeline_source)
            for file in pipeline_files:
                source_path = os.path.join(pipeline_source, file)
                dest_path = os.path.join(deploy_data["absolute_path"], file)
                
                if not os.path.exists(dest_path):
                    if os.path.isfile(source_path):
                        shutil.copy(source_path, dest_path)
                    else:
                        shutil.copytree(source_path, dest_path)

            # Copy terraform files
            terraform_path = os.path.join(self.project_root, self.base_pipeline_path, "Common", "Terraform", "ecs_cluster")
            terraform_dest = os.path.join(deploy_data["absolute_path"])
            
            if os.path.exists(terraform_dest):
                shutil.rmtree(terraform_dest)
            shutil.copytree(terraform_path, terraform_dest)
            
            # Create .env file
            env_path = os.path.join(deploy_data["absolute_path"], ".env")
            logger.info(f"Creating environment file at {env_path}")
            with open(env_path, "w") as f:
                for key, value in deploy_data["environment_variables"].items():
                    f.write(f"{key}={value}\n")
 
        except Exception as e:
            logger.error(f"Error during repository setup: {str(e)}")
            raise ValueError(f"Error cloning repository: {str(e)}")

        # Initialize Terraform
        try:
            logger.info("Initializing Terraform configuration")
            tf_vars = {
                "user_github_id": deploy_data["user_github_id"],
                "aws_access_key": aws_user.aws_access_key_id,
                "aws_secret_access_key": aws_user.aws_secret_access_key,
                "repo_name": deploy.repo_name,
                "absolute_path": deploy_data["absolute_path"].rstrip('/'),
                "owner": deploy.owner,
                "ecs_task_container_port": deploy_data["port"],
                "ecs_task_host_port": deploy_data["port"],
                "aws_region": os.environ.get('AWS_DEFAULT_REGION'),
                "source_branch": getattr(deploy, 'branch_name', 'main')
            }
            tf_vars = {k: v for k, v in tf_vars.items() if v is not None}

            tf_working_dir = os.path.join(deploy_data["absolute_path"], "terraform", "ecs_cluster")
            tf = Terraform(working_dir=tf_working_dir)
            
            # Run setup_backend.sh
            setup_script_path = os.path.join(tf_working_dir, "setup_backend.sh")
            if os.path.exists(setup_script_path):
                logger.info("Running setup_backend.sh script")
                os.chmod(setup_script_path, 0o755)
                subprocess.run(["sh", setup_script_path, deploy_data["user_github_id"]], 
                             cwd=tf_working_dir, capture_output=True, text=True, check=True)

            logger.info("Applying Terraform configuration")
            return_code, stdout, stderr = tf.apply(skip_plan=True, var=tf_vars, capture_output=False, auto_approve=True)
            if return_code != 0:
                logger.error(f"Terraform apply failed. Stdout: {stdout}, Stderr: {stderr}")
                raise HTTPException(status_code=500, detail=f"Failed to apply Terraform configuration: {stderr}")
            
            logger.info("Getting Terraform output")
            output = tf.output(json=True)
            if not output:
                logger.error("Terraform output is empty")
                raise ValueError("Terraform output is empty")

            dns_load_balancer = output.get("load_balancer_dns", {}).get("value")
            ecr_repo_url = output.get("ecr_repo_url", {}).get("value")

            if not dns_load_balancer or not ecr_repo_url:
                missing_outputs = []
                if not dns_load_balancer: missing_outputs.append("load_balancer_dns")
                if not ecr_repo_url: missing_outputs.append("ecr_repo_url")
                logger.error(f"Missing critical Terraform outputs: {', '.join(missing_outputs)}")
                raise ValueError(f"Missing critical Terraform outputs: {', '.join(missing_outputs)}")

        except subprocess.CalledProcessError as e:
            logger.error(f"Error running setup_backend.sh: {e.stderr}")
            raise ValueError(f"Error running setup_backend.sh: {e.stderr}")
        except Exception as e:
            logger.error(f"Error initializing or applying Terraform: {str(e)}")
            raise ValueError(f"Error initializing or applying Terraform: {str(e)}")
        
        deploy_data["load_balancer_url"] = dns_load_balancer
        deploy_data["ecr_repo_url"] = ecr_repo_url

        # Start CodeBuild process
        try:
            codebuild_project_name = f"{user.github_id}-{deploy.repo_name}-codebuild"
            source_branch_for_codebuild = getattr(deploy, 'branch_name', 'main')

            logger.info(f"Starting CodeBuild project: {codebuild_project_name}")
            buildspec_file_path = os.path.join(deploy_data["absolute_path"],"ecs_cluster","buildspec.yml")
            buildspec_content = ""
            if os.path.exists(buildspec_file_path):
                with open(buildspec_file_path, "r") as f:
                    buildspec_content = f.read()
            else:
                logger.warning(f"buildspec.yml not found at {buildspec_file_path}. CodeBuild might use project default.")

            build_response = self.codebuild_service.start_build(
                project_name=codebuild_project_name,
                ecr_repo_url=ecr_repo_url,
                source_version=source_branch_for_codebuild,
                buildspec_content=buildspec_content,
                port=deploy_data["port"],
                entry_point=deploy_data["entry_point"],
                image_tag=deployment_tag,  # Pass the unique tag to CodeBuild
                github_username=user.github_id,  # Pass GitHub username
                repo_name=deploy.repo_name,  # Pass repository name
                absolute_path=deploy_data["absolute_path"].rstrip('/')
            )
            logger.info(f"CodeBuild started successfully: {build_response}")
            deploy_data["codebuild_build_id"] = build_response.get('build', {}).get('id')
            deploy_data["image_tag"] = deployment_tag  # Store the tag in deploy data

        except Exception as e:
            logger.error(f"Error starting CodeBuild build: {str(e)}")
            deploy_data["codebuild_build_id"] = None
            deploy_data["image_tag"] = deployment_tag  # Still store the tag even if build fails

        logger.info(f"Creating deployment record for {deploy.owner}/{deploy.repo_name}")
        return await self.deploy_repository.create_deploy(deploy_data)