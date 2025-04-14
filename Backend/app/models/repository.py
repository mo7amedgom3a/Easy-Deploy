from pydantic import BaseModel
from typing import Optional, List

class Repository(BaseModel):
    name: str
    full_name: str
    private: bool
    html_url: str
    node_id: str
    owner: str
    url: str
    created_at: str
    updated_at: str
    pushed_at: str
    default_branch: str
    blobs_url: str
    description: str | None = None
    language: str | None = None
    