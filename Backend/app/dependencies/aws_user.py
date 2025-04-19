from fastapi import Depends
from dependencies.database_connection import DatabaseConnection
from repositories.aws_user import AWSUserRepository

def get_aws_user_repository(db: DatabaseConnection = Depends(DatabaseConnection)) -> AWSUserRepository:
    """
    Dependency to get an instance of AWSUserRepository.
    """
    return AWSUserRepository(db)