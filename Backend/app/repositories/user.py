from interfaces.user_interface import UserInterface
from typing import Optional
from schemas.user_schema import UserSchema
from bson import ObjectId
from dependencies.database_connection import DatabaseConnection

from hashlib import sha256

class User(UserInterface):
    def __init__(self, db: DatabaseConnection):
        self.db = db
    

    def hash_access_key(self, access_token: str) -> str:
        """
        Hash the access key using SHA-256.
        """
        return sha256(access_token.encode()).hexdigest()

    def verify_access_key(self, access_token: str, hashed_access_key: str) -> bool:
        """
        Verify the access key against the hashed access key.
        """
        return self.hash_access_key(access_token) == hashed_access_key

    def map_user_response_to_user(self, user: dict) -> UserSchema:
        return UserSchema(
            github_id=str(user.get("id")),
            name=user.get("name", ""),
            login=user.get("login"),
            bio=user.get("bio"),
            access_token=user.get("access_token"),
            repos_urls=user.get("repos_url") if user.get("repos_url") else "",
            email=user.get("email", "") or "",
            avatar_url=user.get("avatar_url"),
        )
    

    async def get_or_create_user(self, user_data: dict) -> UserSchema:
        collection = await self.db.get_collection("users")
        user = await collection.find_one({"github_id": str(user_data.get("id"))})
        if not user:
            user = self.map_user_response_to_user(user_data)
            user_dict = user.dict()
            user_dict["_id"] = ObjectId()
            user_dict["hashed_access_key"] = self.hash_access_key(user_dict["access_token"])
            await collection.insert_one(user_dict)
            return user
        return UserSchema(**user)
           

    async def get_all(self) -> list[UserSchema]:
        collection = await self.db.get_collection("users")
        users = []
        async for user in collection.find():
            if user.get("access_token"):
                user["access_token"] = self.verify_access_key(user["access_token"], user.get("hashed_access_key", ""))
            users.append(UserSchema(**user))
        return users


    async def get_by_id(self, user_id: str) -> UserSchema:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            user_data["access_token"] = self.verify_access_key(user_data.get("access_token", ""), user_data.get("hashed_access_key", ""))
            return UserSchema(**user_data)
        return None
    

    async def get_user_by_github_id(self, github_id: int) -> UserSchema:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"github_id": github_id})
        
        if user_data:
            user_data["email"] = user_data.get("email", "") or ""
            user_data["login"] = user_data.get("login", "") or ""
            return UserSchema(**user_data)
        return None
