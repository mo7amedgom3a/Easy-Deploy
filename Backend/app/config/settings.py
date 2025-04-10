import os 
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("CONNECTION_STRING")
    LOCAL_DATABASE_URL = os.getenv("LOCAL_CONNECTION_STRING")
    DATABASE_NAME = os.getenv("DATABASE_NAME")
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")
    REDIRECT_URI = os.getenv("REDIRECT_URI")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
    EXPIRATION_TIME = os.getenv("EXPIRATION_TIME")
    

    
settings = Settings()