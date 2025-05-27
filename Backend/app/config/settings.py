import os 
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL = os.getenv("CONNECTION_STRING")
    LOCAL_DATABASE_URL = os.getenv("LOCAL_CONNECTION_STRING")
    DATABASE_NAME = os.getenv("DATABASE_NAME")
    DIR_BASE = os.getenv("DIR_BASE")
    CLIENT_ID = os.getenv("CLIENT_ID")
    CLIENT_SECRET = os.getenv("CLIENT_SECRET")
    REDIRECT_URI = os.getenv("REDIRECT_URI")
    GITHUB_APP_ACCESS_TOKEN = os.getenv("GITHUB_APP_ACCESS_TOKEN") # ALLOW CREATE REPO FOR OUR APP 
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
    EXPIRATION_TIME = os.getenv("EXPIRATION_TIME")
    

    
settings = Settings()