from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Deploy(BaseModel):
    aws_user_id: str
    repo_id: str
    branch: str
    pipline_path: str
    freamework: str
    root_folder_path: str
    webhook_id: str
    status: str
    app_entry_point: str  # e.g., "main.py" or "app.py"
    port: Optional[int] = None  # port on which the application runs
    environment_variables: Optional[dict] = None  # environment variables for the application
    created_at: datetime = datetime.now()
    updated_at: Optional[datetime] = None