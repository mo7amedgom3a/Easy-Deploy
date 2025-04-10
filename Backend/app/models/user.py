from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    github_id: str
    name: str
    username : Optional[str] = None # login
    bio: Optional[str] = None
    access_token: Optional[str] = None
    repos_urls: Optional[list[str]] = None
    email: str
    avatar_url: Optional[str] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        use_enum_values = True
        arbitrary_types_allowed = True




