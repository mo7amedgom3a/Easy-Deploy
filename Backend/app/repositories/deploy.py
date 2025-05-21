from schemas.deploy_schema import DeploySchema, DeployUpdate, DeployCreateSchema
from typing import List, Dict
from models.deploy import Deploy
from datetime import datetime
from dependencies.database_connection import DatabaseConnection

class DeployRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.collection = "deploys"

    async def create_deploy(self, deploy: Dict) -> Deploy:
        """
        Create a new deploy record in the database.
        """
        collection = await self.db.get_collection(self.collection)
        deploy_data = deploy.copy()
        deploy_data["created_at"] = datetime.now()
        deploy_data["updated_at"] = datetime.now()
        result = await collection.insert_one(deploy_data)
        if (result.inserted_id):
            return Deploy(**deploy_data)
        else:
            raise Exception("Failed to create deploy record")
        
    async def get_deploy(self, repo_name: str, owner: str) -> Deploy:
        """
        Get a deploy record from the database.
        """
        collection = await self.db.get_collection(self.collection)
        deploy = await collection.find_one({"repo_name": repo_name, "owner": owner})
        return Deploy(**deploy)
    