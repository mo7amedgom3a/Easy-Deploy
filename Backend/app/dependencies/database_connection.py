import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings

class DatabaseConnection:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.DATABASE_URL)
        
    async def get_database(self):
        return self.client[settings.DATABASE_NAME]
    
    async def get_collection(self, name):
        return self.client[settings.DATABASE_NAME][name]
    
    async def close(self):
        self.client.close()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_value, traceback):
        await self.close()
