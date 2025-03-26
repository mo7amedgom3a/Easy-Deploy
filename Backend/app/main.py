from fastapi import FastAPI
import uvicorn
from routers import user
from dependencies.database_connection import DatabaseConnection

app = FastAPI()
@app.on_event("startup")
async def startup_db_client():
    app.state.db_client = await DatabaseConnection().get_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    await DatabaseConnection().close()

app.include_router(user.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)