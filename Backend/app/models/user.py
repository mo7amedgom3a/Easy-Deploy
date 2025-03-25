from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional

class User(BaseModel):
    id: str
    name: str
    age: int
    phone: str
    email: str
    


