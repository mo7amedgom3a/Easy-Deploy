from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from fastapi.responses import RedirectResponse, JSONResponse
from services.oauth import get_github_user
from services.user import UserService
from typing import Optional
from schemas.user_schema import UserSchema

from services.jwt import create_access_token
from dependencies.services import get_user_service
from config.settings import settings
from dependencies.security import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/logout")
async def logout():
    response = JSONResponse(content={"message": "Successfully logged out"})
    response.delete_cookie(key="authorization")
    return response

@router.post("/logout")
async def logout_post(authorization: Optional[str] = Header(None)):
    # Handle POST request from frontend logout API
    # Extract token from Authorization header
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
    
    # Here you could implement token blacklisting or invalidation
    # For example, add the token to a Redis blacklist with its expiry time
    
    response = JSONResponse(content={"message": "Successfully logged out"})
    response.delete_cookie(key="authorization")
    return response

@router.get("/login")
async def login(state: Optional[str] = None):    
    # Updated GitHub scope to ensure proper repository and user access
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={settings.CLIENT_ID}"
        f"&redirect_uri={settings.REDIRECT_URI}"
        f"&scope=repo:status read:repo_hook"
    )
    
    # Add state parameter if provided (used for redirecting back to the correct page)
    if state:
        github_auth_url += f"&state={state}"
        
    return RedirectResponse(github_auth_url)

@router.get("/github/callback")
async def github_callback(
    request: Request, 
    code: str, 
    state: Optional[str] = None,
    user_service: UserService = Depends(get_user_service)
):
    """
    This endpoint handles the GitHub callback after user authentication.
    It retrieves user data and creates or fetches the user in the system.
    """
    user_data = await get_github_user(code)
    if not user_data:
        raise HTTPException(status_code=400, detail="GitHub authentication failed")
    
    # Debug logging to help diagnose issues
    print(f"GitHub user data received: {user_data.keys()}")
    
    user_data["id"] = str(user_data.get("id"))
    user = await user_service.get_or_create_user(user_data)
    if not user:
        raise HTTPException(status_code=400, detail="User creation failed")

    token = create_access_token(data={"sub": user.github_id, "name": user.login, "access_key": user_data.get("access_token")})
    if not token:
        raise HTTPException(status_code=400, detail="Token creation failed")
    
    # Return the token and state in the response
    response_data = {
        "jwt_token": token,
        "token": token,
        "user": {
           
            "login": user.login,
            "github_id": user.github_id
        }
    }
    
    if state:
        response_data["state"] = state
    
    return JSONResponse(content=response_data)

@router.get("/check")
async def check_auth(current_user: UserSchema = Depends(get_current_user)):
    """
    Check if the current user is authenticated and return their info
    """
    return {
        "isAuthenticated": True,
        "user": current_user
    }