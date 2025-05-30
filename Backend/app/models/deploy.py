from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from bson import ObjectId
class Deploy(BaseModel):
    user_github_id: Optional[str] = None
    repo_name: Optional[str] = None
    owner: Optional[str] = None
    branch: Optional[str] = None
    pipeline_path: Optional[str] = None  # path to the pipeline file
    framework: Optional[str] = None  # e.g., "flask", "django", etc.
    root_folder_path: Optional[str] = None
    ecr_repo_url: Optional[str] = None
    absolute_path: Optional[str] = None  # absolute path to the repository on the server
    build_command: Optional[str] = None  
    run_command: Optional[str] = None 
    load_balancer_url: Optional[str] = None
    webhook_id: Optional[str] = None
    status: Optional[str] = None  # e.g., "pending", "in_progress", "completed", "failed"
    app_entry_point: Optional[str] = None  # e.g., "main.py" or "app.py"
    port: Optional[int] = None 
    environment_variables: Optional[Dict[str, str]] = None  # environment variables for the application
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
