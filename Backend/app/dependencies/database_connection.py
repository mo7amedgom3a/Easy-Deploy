import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import settings
import logging
logger = logging.getLogger('uvicorn.error')

class DatabaseConnection:
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseConnection, cls).__new__(cls)
            cls._instance.database_url = settings.DATABASE_URL
            cls._instance.local_database_url = settings.LOCAL_DATABASE_URL
        return cls._instance

    @property
    def client(self):
        return self.__class__._client

    @client.setter
    def client(self, value):
        self.__class__._client = value

    async def connect(self):
        if self.client is None:  # Only connect if no client exists
            try:
                self.client = AsyncIOMotorClient(self.database_url)
                # Trigger a server selection to ensure connection
                print(f"Connecting to MongoDB at {self.database_url}")
                await self.client.server_info()
                
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
            self.client = None
    
    async def __aenter__(self):
        await self.connect()
        return self
    
    async def __aexit__(self, exc_type, exc_value, traceback):
        await self.close()
