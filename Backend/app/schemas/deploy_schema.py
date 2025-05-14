from datetime import datetime
from typing import Dict, Optional

from pydantic import BaseModel


class BaseDeploySchema(BaseModel):
    """Base schema with common deploy fields"""
    repo_name: str
    owner: str
    branch: str
    framework: Optional[str] = None
    root_folder_path: str = ""
    app_entry_point: Optional[str] = None
    port: Optional[int] = None
    environment_variables: Optional[Dict[str, str]] = None

    class Config:
        orm_mode = True
        extra = "allow"


class DeployCreateSchema(BaseDeploySchema):
    """Schema for creating a new deployment"""
    build_command: Optional[str] = None
    run_command: Optional[str] = None


class DeploySchema(BaseDeploySchema):
    """Schema for a complete deployment record"""
    pipeline_path: Optional[str] = None
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

    class Config:
        orm_mode = True
