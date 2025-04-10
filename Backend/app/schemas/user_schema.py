from pydantic import BaseModel
from typing import Optional

class UserSchema(BaseModel):
    github_id: Optional[str] = None
    name: str
    username: Optional[str] = None
    bio: Optional[str] = None
    repos_urls: Optional[list[str]] = None
    access_token: Optional[str] = None
    email: str
    avatar_url: Optional[str] = None

    class Config:
        orm_mode = True
        allow_population_by_field_name = True



