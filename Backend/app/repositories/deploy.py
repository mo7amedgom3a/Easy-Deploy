from schemas.deploy_schema import DeploySchema, DeployUpdate, DeployCreateSchema
from typing import List, Dict, Optional
from models.deploy import Deploy
from datetime import datetime
from dependencies.database_connection import DatabaseConnection
import logging

logger = logging.getLogger('database')

class DeployRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db
        self.collection = "deploys"
        logger.info("DeployRepository initialized")

    async def create_deploy(self, deploy: Dict) -> Deploy:
        """
        Create a new deploy record in the database.
        """
        logger.info(f"Creating new deployment record for {deploy.get('owner')}/{deploy.get('repo_name')}")
        collection = await self.db.get_collection(self.collection)
        deploy_data = deploy.copy()
        deploy_data["created_at"] = datetime.now()
        deploy_data["updated_at"] = datetime.now()
        try:
            result = await collection.insert_one(deploy_data)
            if result.inserted_id:
                logger.info(f"Successfully created deployment record with ID: {result.inserted_id}")
                return Deploy(**deploy_data)
            else:
                logger.error("Failed to create deploy record - no inserted ID returned")
                raise Exception("Failed to create deploy record")
        except Exception as e:
            logger.error(f"Error creating deployment record: {str(e)}")
            raise
        
    async def get_deploy(self, repo_name: str, owner: str) -> Optional[Deploy]:
        """
        Get a deploy record from the database.
        """
        logger.info(f"Fetching deployment record for {owner}/{repo_name}")
        collection = await self.db.get_collection(self.collection)
        try:
            deploy = await collection.find_one({"repo_name": repo_name, "owner": owner})
            if deploy:
                logger.info(f"Found deployment record for {owner}/{repo_name}")
                return Deploy(**deploy)
            else:
                logger.warning(f"No deployment record found for {owner}/{repo_name}")
                return None
        except Exception as e:
            logger.error(f"Error fetching deployment record: {str(e)}")
            raise
    