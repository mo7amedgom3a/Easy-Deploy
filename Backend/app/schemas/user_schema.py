from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: Optional[str] = None
    name: str
    email: str
    password: str

class UserCreate(User):
    password: str

class UserUpdate(User):
    password: Optional[str] = None


class UserInDB(User):
    hashed_password: str
