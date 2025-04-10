from pydantic import BaseModel
from typing import Optional, List

class Repository(BaseModel):
    name: str
    full_name: str
    private: bool
    html_url: str
    description: Optional[str] = None
    language: Optional[str] = None