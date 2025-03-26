from interfaces.user_interface import UserRepository as UserRepositoryInterface
from schemas.user_schema import User, UserCreate, UserUpdate
from bson import ObjectId
from dependencies.database_connection import DatabaseConnection

class UserRepository(UserRepositoryInterface):
    def __init__(self, db: DatabaseConnection):
        self.db = db

    def _user_to_dict(self, user: User) -> dict:
        return {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "password": user.password
        }
    
    async def create(self, user: UserCreate) -> User:
        user_dict = self._user_to_dict(user)
        collection = await self.db.get_collection("users")
        result = await collection.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        return User(**user_dict)

    async def get_by_id(self, user_id: str) -> User:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"_id": ObjectId(user_id)})
        if user_data:
            return User(**user_data)
        return None

    async def get_by_email(self, email: str) -> User:
        collection = await self.db.get_collection("users")
        user_data = await collection.find_one({"email": email})
        if user_data:
            return User(**user_data)
        return None
    
    async def update(self, user: UserUpdate) -> User:
        user_dict = self._user_to_dict(user)
        collection = await self.db.get_collection("users")
        result = await collection.update_one(
            {"_id": ObjectId(user.id)},
            {"$set": user_dict}
        )
        return User(**user_dict)