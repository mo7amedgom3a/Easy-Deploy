from interfaces.user_interface import UserInterface
from schemas.user_schema import UserSchema
from bson import ObjectId
from dependencies.database_connection import DatabaseConnection

class User(UserInterface):
    def __init__(self, db: DatabaseConnection):
        self.db = db
  
    def map_user_response_to_user(self, user: dict) -> UserSchema:
        return UserSchema(
            github_id=str(user.get("id")),
            name=user.get("name", ""),
            username=user.get("login"),
            bio=user.get("bio"),
            access_token=user.get("access_token"),
            repos_urls=[user.get("repos_url")] if user.get("repos_url") else [],
            email=user.get("email") or "",
            avatar_url=user.get("avatar_url"),
        )
    async def get_or_create_user(self, user_data: dict) -> UserSchema:
        collection = await self.db.get_collection("users")
        user = await collection.find_one({"github_id": user_data["id"]})
        if not user:
            user = self.map_user_response_to_user(user_data)
            user_data["_id"] = ObjectId()
            await collection.insert_one(user_data)
            return user
        return UserSchema(**user)
           

    async def get_all(self) -> list[UserSchema]:
        collection = await self.db.get_collection("users")
        users = []
        async for user in collection.find():
            users.append(UserSchema(**user))
        return users

    async def get_by_id(self, user_id: str) -> UserSchema:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return UserSchema(**user_data)
        return None
    async def get_user_access_token(self, github_id: str) -> str:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"github_id": github_id})
        if user_data:
            return user_data.get("access_token", "")
        return None
    async def get_user_by_github_id(self, github_id: str) -> UserSchema:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"github_id": github_id})
        if user_data:
            user_data["email"] = user_data.get("email", "") or ""
            return UserSchema(**user_data)
        return None

    async def get_by_email(self, email: str) -> UserSchema:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"email": email})
        if user_data:
            return UserSchema(**user_data)
        return None
