# this file to inject the database connection to the repositories
# and return the repository instance
from fastapi import Depends
from dependencies.database_connection import DatabaseConnection
from repositories.user import UserRepository

async def get_user_repository(db: DatabaseConnection = Depends(DatabaseConnection)) -> UserRepository:
    return UserRepository(db) 