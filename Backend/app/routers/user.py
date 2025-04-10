from fastapi import APIRouter, Depends, HTTPException
from services.user import UserService
from schemas.user_schema import UserSchema
from dependencies.security import get_current_user
from fastapi.security import OAuth2PasswordBearer

from dependencies.services import get_user_service

router = APIRouter(prefix="/users", tags=["users"])



@router.get("/{user_id}", response_model=UserSchema)
async def get_user_by_id(
    user_id: str, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
@router.get("/", response_model=list[UserSchema])
async def get_all_users(
    user_service: UserService = Depends(get_user_service)
):
    users = await user_service.get_all_users()
    return users
@router.get("/github/me", response_model=UserSchema, dependencies=[Depends(get_current_user)])
async def get_current_user_info(
    current_user: UserSchema = Depends(get_current_user)
):
    return current_user

@router.get("/email/{email}", response_model=UserSchema)
async def get_user_by_email(
    email: str, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

