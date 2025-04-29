from pydantic import BaseModel
from typing import Optional, List

class RepositorySchema(BaseModel):
    name: Optional[str] = None
    private: Optional[bool] = None
    html_url: Optional[str] = None
    url: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    pushed_at: Optional[str] = None
    default_branch: Optional[str] = None
    blob_sha: Optional[str] = None
    description: Optional[str] = None
    languages: Optional[List[str]] = None  # Changed to List[str] only
    language: Optional[str] = None
 