from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from routers import user, auth, git_repositories
import os
from dotenv import load_dotenv
from dependencies.database_connection import DatabaseConnection
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends

app = FastAPI()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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

@app.on_event("shutdown")
async def shutdown_db_client():
    await DatabaseConnection().close()


app.include_router(user.router, dependencies=[Depends(oauth2_scheme)])
app.include_router(auth.router)
app.include_router(git_repositories.router)


if __name__ == "__main__":
    load_dotenv()
    uvicorn.run(app, host=os.getenv("HOST"), port=os.getenv("PORT"))