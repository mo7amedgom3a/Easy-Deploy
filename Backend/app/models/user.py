from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    github_id: str
    name: str
    username : Optional[str] = None # login
    bio: Optional[str] = None
    access_token: Optional[str] = None
    repos_urls: Optional[list[str]] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True
        populate_by_name = True
        use_enum_values = True
        arbitrary_types_allowed = True




