from fastapi import Depends
from dependencies.database_connection import DatabaseConnection
from repositories.git_repository import GitRepository

async def get_git_repository(db: DatabaseConnection = Depends(DatabaseConnection)) -> GitRepository:
    """
    Dependency to get the GitRepository instance with a database connection.
    """
    return GitRepository(db)