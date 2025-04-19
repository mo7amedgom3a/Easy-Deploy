from typing import Protocol, TypedDict, Literal, Optional
from pydantic import BaseModel
from schemas.aws_user_schema import AWSUserSchema
from abc import ABC, abstractmethod

class AWSUserInterface(ABC):
    @abstractmethod
    def create_user(self, user_data: AWSUserSchema) -> str:
        """Create a new AWS user and return the user ID."""
        pass

    @abstractmethod
    def get_user(self, user_id: str) -> AWSUserSchema:
        """Retrieve an AWS user by their ID."""
        pass

    @abstractmethod
    def update_user(self, user_id: str, user_data: AWSUserSchema) -> bool:
        """Update an existing AWS user's information."""
        pass

    @abstractmethod
    def delete_user(self, user_id: str) -> bool:
        """Delete an AWS user by their ID."""
        pass
    @abstractmethod
    def list_users(self, limit: Optional[int] = None) -> list[AWSUserSchema]:
        """List AWS users with an optional limit on the number of users."""
        pass
    
