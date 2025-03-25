# create a dependency to connect to the database 
# and return a motor client

from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
from fastapi import Depends, HTTPException, status

class DatabaseConnection:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.DATABASE_URL)

    async def get_database(self) -> AsyncIOMotorClient:
        async with await self.client.start_session() as session:
            try:
                yield session
            finally:
                await session.end_session()

