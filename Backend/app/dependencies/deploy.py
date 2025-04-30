from fastapi import Depends
from dependencies.database_connection import DatabaseConnection
from repositories.deploy import DeployRepository

async def get_deploy_repository(db: DatabaseConnection = Depends(DatabaseConnection)) -> DeployRepository:
    """
    Dependency to get the DeployRepository instance with a database connection.
    """
    return DeployRepository(db)