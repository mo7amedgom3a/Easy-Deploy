import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
import logging
logger = logging.getLogger('uvicorn.error')

class DatabaseConnection:
    def __init__(self):
        self.client = None
        self.database_url = settings.DATABASE_URL
        self.local_database_url = settings.LOCAL_DATABASE_URL

    async def connect(self):
        try:
            self.client = AsyncIOMotorClient(self.database_url)
            # Trigger a server selection to ensure connection
            await self.client.server_info()
            await self.client.admin.command('ping')
            logger.info("Connected to MongoDB Successfully")
        except Exception as e:
            logger.error(f"Error while connected to MongoDB: {e}")
    
    async def get_database(self):
        if not self.client:
            await self.connect()
        return self.client[settings.DATABASE_NAME]
    
    async def get_collection(self, name):
        if not self.client:
            await self.connect()
        return self.client[settings.DATABASE_NAME][name]
    
    async def close(self):
        if self.client:
            self.client.close()
    
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_value, traceback):
        await self.close()
