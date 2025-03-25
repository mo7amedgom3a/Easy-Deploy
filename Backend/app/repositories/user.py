from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import Depends
from models.user import User
from interfaces.user_interface import UserRepository
from dependencies.database_connection import DatabaseConnection

class UserRepository(UserRepository):
    def __init__(self, db: AsyncIOMotorClient = Depends(DatabaseConnection().get_database)):
        self.db = db.client["users_db"]
        self.collection = self.db["users"]

    async def create(self, user: User) -> User:
        user_dict = user.dict()
        result = await self.collection.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        return User(**user_dict)

    async def get_by_id(self, user_id: str) -> Optional[User]:
        from bson import ObjectId
        try:
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            if user:
                user["id"] = str(user.pop("_id"))
                return User(**user)
            return None
        except:
            return None

    async def get_all(self) -> List[User]:
        users = []
        cursor = self.collection.find({})
        async for document in cursor:
            document["id"] = str(document.pop("_id"))
            users.append(User(**document))
        return users
