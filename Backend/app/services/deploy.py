import json
import os
from pathlib import Path
from typing import Dict

from models.deploy import Deploy
from repositories.deploy import DeployRepository
from schemas.deploy_schema import DeployCreateSchema


class DeployService:
    def __init__(self, deploy_repository: DeployRepository):
        self.deploy_repository = deploy_repository
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

    async def create_deploy(self, deploy: DeployCreateSchema) -> Deploy:
        """Create a new deployment record with default or overridden configuration."""
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
        deploy_data["pipline_path"] = self._get_pipeline_path(framework, framework_type)
        
        return await self.deploy_repository.create_deploy(Deploy(**deploy_data))