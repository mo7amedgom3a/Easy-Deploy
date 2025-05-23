from schemas.aws_user_schema import AWSUserSchema
from typing import List
from dependencies.database_connection import DatabaseConnection
from models.aws_user import AWSUser
class AWSUserRepository:
    def __init__(self, db:DatabaseConnection):
        self.db = db

    async def create_user(self, user: AWSUser) -> AWSUserSchema:
        collection = await self.db.get_collection("aws_users")
        
        user_dict = user.dict()
        result = await collection.insert_one(user_dict)
        return AWSUserSchema(id=str(result.inserted_id), **user_dict)
    

    async def get_user(self, user_id: str) -> AWSUserSchema:
        collection = await self.db.get_collection("aws_users")
        user = await collection.find_one({"user_github_id": user_id})
        if not user:
            return None
        return AWSUserSchema(**user)
    

    async def get_all_users(self) -> List[AWSUserSchema]:
        collection = await self.db.get_collection("aws_users")
        users = await collection.find().to_list(length=None)
        return users

    async def update_user(self, user: AWSUser) -> AWSUserSchema:
        collection = await self.db.get_collection("aws_users")
        user_data = user.dict()
        result = await collection.update_one({"_id": user.user_github_id}, {"$set": user_data})
        if result.modified_count == 0:
            return None
        return AWSUserSchema(**user_data)
    
    async def delete_user(self, user_id: str) -> bool:
        collection = await self.db.get_collection("aws_users")
        result = await collection.delete_one({"_id": user_id})
        return result.deleted_count > 0