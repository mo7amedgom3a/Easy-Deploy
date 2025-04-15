from fastapi import APIRouter, Depends, HTTPException
from services.user import UserService
from schemas.user_schema import UserSchema
from dependencies.security import get_current_user
from fastapi.security import OAuth2PasswordBearer

from dependencies.services import get_user_service

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(get_current_user)])
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/{user_id}", response_model=UserSchema)
async def get_user_by_id(
    user_id: str, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/github/{github_id}", response_model=UserSchema)
async def get_user_by_github_id(
    github_id: str, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user_by_github_id(github_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/", response_model=list[UserSchema])
async def get_all_users(
    user_service: UserService = Depends(get_user_service)
):
    users = await user_service.get_all_users()
    return users

# /github/me
@router.get("/github/me/", response_model=UserSchema, dependencies=[Depends(get_current_user)])
async def get_current_user_info(
    current_user: UserSchema = Depends(get_current_user)
):
    return current_user

@router.get("/github/me/access_key", response_model=str, dependencies=[Depends(get_current_user)])
async def get_current_user_access_key(
    current_user: UserSchema = Depends(get_current_user)
):
    return current_user.access_token
