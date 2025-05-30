from schemas.deploy_schema import DeploySchema, DeployUpdate, DeployCreateSchema
from typing import List, Dict, Optional
from models.deploy import Deploy
from datetime import datetime
from bson import ObjectId
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
        deploy_data["status"] = "success"
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
        
    async def get_deploys(self, owner: str, repo_name: str) -> List[Deploy]:
        """
        Get a deploys records from the database.
        """
        logger.info(f"Fetching deployment record for {owner}/{repo_name}")
        collection = await self.db.get_collection(self.collection)
        
        try:
            deploys = await collection.find({"owner": owner, "repo_name": repo_name}).to_list(length=None)
            return [Deploy(**deploy) for deploy in deploys]
        except Exception as e:
            logger.error(f"Error fetching deployment record: {str(e)}")
            raise
    
    # get a list of all the deploys for owner
    async def get_deploys_for_owner(self, owner: str) -> List[Deploy]:
        """
        Get a list of all the deploys for a given owner.
        """
        logger.info(f"Fetching all deployment records for {owner}")
        collection = await self.db.get_collection(self.collection)
        try:
            deploys = await collection.find({"owner": owner}).to_list(length=None)
            print(f"deploys: {deploys}")
            logger.info(f"Found {len(deploys)} deployment records for {owner}")
            return [Deploy(**deploy) for deploy in deploys]
        except Exception as e:
            logger.error(f"Error fetching deployment records: {str(e)}")
            raise
    # deployment statistics
    async def get_deployment_statistics(self, owner: str) -> Dict:
        """
        Get deployment statistics for a specific owner.
        """
        logger.info(f"Fetching deployment statistics for owner: {owner}")
        collection = await self.db.get_collection(self.collection)
        try:
            # Get total number of deployments for owner
            total_deployments = await collection.count_documents({"owner": owner})
            logger.info(f"Total deployments for {owner}: {total_deployments}")
            
            # Get total number of deployments by status for owner
            successful_deployments = await collection.count_documents({"owner": owner, "status": "success"})
            failed_deployments = await collection.count_documents({"owner": owner, "status": "failed"}) 
            pending_deployments = await collection.count_documents({"owner": owner, "status": "pending"})

            return {
                "total": total_deployments,
                "successful": successful_deployments,
                "failed": failed_deployments,
                "pending": pending_deployments,
            }

        except Exception as e:
            logger.error(f"Error getting deployment statistics for {owner}: {str(e)}")
            raise