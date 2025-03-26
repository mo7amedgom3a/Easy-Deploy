from fastapi import APIRouter, Depends, HTTPException
from services.user import UserService
from schemas.user_schema import User, UserCreate, UserUpdate

from dependencies.services import get_user_service

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=User)
async def create_user(
    user: UserCreate, 
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.create_user(user)

@router.get("/{user_id}", response_model=User)
async def get_user_by_id(
    user_id: str, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/email/{email}", response_model=User)
async def get_user_by_email(
    email: str, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=User)
async def update_user(
    user_id: str, 
    user: UserUpdate, 
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.update_user(user_id, user)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
