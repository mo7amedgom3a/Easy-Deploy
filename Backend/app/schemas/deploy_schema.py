from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel


class BaseDeploySchema(BaseModel):
    """Base schema with common deploy fields"""
    user_github_id: str
    repo_id: str
    repo_name: str
    owner: str
    branch: str
    framework: Optional[str] = None
    root_folder_path: str
    app_entry_point: Optional[str] = None
    port: Optional[str] = None
    environment_variables: Optional[Dict[str, str]] = None


class DeployCreateSchema(BaseDeploySchema):
    """Schema for creating a new deployment"""
    build_command: Optional[str] = None
    run_command: Optional[str] = None


class DeploySchema(BaseDeploySchema):
    """Schema for a complete deployment record"""
    pipline_path: Optional[str] = None
    webhook_id: Optional[str] = None
    status: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None


class DeployUpdate(BaseModel):
    """Schema for updating deployment status"""
    status: Optional[str] = None
    pipline_path: Optional[str] = None
    webhook_id: Optional[str] = None
    updated_at: datetime = datetime.now()
