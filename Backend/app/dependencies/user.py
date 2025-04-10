# this file to inject the database connection to the repositories
# and return the repository instance
from fastapi import Depends
from dependencies.database_connection import DatabaseConnection
from repositories.user import User

async def get_user(db: DatabaseConnection = Depends(DatabaseConnection)) -> User:
    return User(db) 