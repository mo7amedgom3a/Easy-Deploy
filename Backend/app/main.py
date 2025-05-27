from fastapi import FastAPI, Depends
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.openapi.utils import get_openapi
from routers import user, auth, git_repositories, aws_user, deploy, monitoring, git_deploy
import os
from dotenv import load_dotenv
from dependencies.database_connection import DatabaseConnection
from config.logging_config import setup_logging

load_dotenv()

# Initialize logging
loggers = setup_logging()
logger = loggers['api']

app = FastAPI()

# Define the OAuth2 scheme for Swagger/OpenAPI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

# Allow Swagger to use the Bearer token in Authorization header
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="My API",
        version="1.0.0",
        description="API with JWT auth",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path in openapi_schema["paths"].values():
        for operation in path.values():
            operation["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await DatabaseConnection().connect()
    logger.info("Application starting up...")

@app.on_event("shutdown")
async def shutdown_db_client():
    await DatabaseConnection().close()
    logger.info("Application shutting down...")

# for health check on aws
@app.get("/")
def root():
    return {"message": "Hello"}

# Routers that require authentication
app.include_router(user.router, dependencies=[Depends(oauth2_scheme)])
app.include_router(aws_user.router, dependencies=[Depends(oauth2_scheme)])
app.include_router(monitoring.router, dependencies=[Depends(oauth2_scheme)])
app.include_router(git_deploy.router, dependencies=[Depends(oauth2_scheme)])

# Routers that do not require authentication
app.include_router(auth.router)
app.include_router(git_repositories.router)
app.include_router(deploy.router)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
