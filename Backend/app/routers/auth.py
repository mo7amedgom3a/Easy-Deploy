from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from services.oauth import get_github_user
from services.user import UserService

from services.jwt import create_access_token
from dependencies.services import get_user_service
from config.settings import settings
from dependencies.security import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
async def login():    
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.CLIENT_ID}&redirect_uri={settings.REDIRECT_URI}&scope=user:email"
    )
    return RedirectResponse(github_auth_url)

@router.get("/github/callback")
async def github_callback(request: Request, code: str, user_service: UserService = Depends(get_user_service)):
    """
    This endpoint handles the GitHub callback after user authentication.
    It retrieves user data and creates or fetches the user in the system.
    """
    user_data = await get_github_user(code)
    if not user_data:
        raise HTTPException(status_code=400, detail="GitHub authentication failed")
    user_data["id"] = str(user_data.get("id"))
    user = await user_service.get_or_create_user(user_data)
    if not user:
        raise HTTPException(status_code=400, detail="User creation failed")

    token = create_access_token(data={"sub": user.github_id, "name": user.name, "access_key": user_data.get("access_token")})
    if not token:
        raise HTTPException(status_code=400, detail="Token creation failed")
    return {"jwt_token": token, "token_type": "bearer", "user": user}