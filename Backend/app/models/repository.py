from pydantic import BaseModel
from typing import Optional, List

class Repository(BaseModel):
    name: str
    private: bool
    html_url: str
    url: str
    created_at: str
    updated_at: str
    pushed_at: str
    default_branch: str
    root_folder: str
    blob_sha: str
    description: str | None = None
    languages: List[str] | None = None

    class Config:
        from_attributes = True
    