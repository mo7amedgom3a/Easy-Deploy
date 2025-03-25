from fastapi import APIRouter, Depends, HTTPException
from services.user import UserService
from models.user import User
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=User)
async def create_user(user: User, user_service: UserService = Depends(UserService)):
    return await user_service.create_user(user)



@router.get("/{user_id}", response_model=User)
async def get_user_by_id(user_id: str, user_service: UserService = Depends(UserService)):
    user = await user_service.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[User])
async def get_all_users(user_service: UserService = Depends(UserService)):
    return await user_service.get_all_users()

