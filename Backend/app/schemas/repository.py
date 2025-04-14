from pydantic import BaseModel
from typing import Optional, List

class RepositorySchema(BaseModel):
    name: Optional[str] = None
    full_name: Optional[str] = None
    private: Optional[bool] = None
    html_url: Optional[str] = None
    node_id: Optional[str] = None
    url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    pushed_at: Optional[str] = None
    default_branch: Optional[str] = None
    blobs_url: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None