from fastapi import Depends, HTTPException, APIRouter
from services.aws_user import AWSUserService
from schemas.aws_user_schema import AWSUserSchema
from dependencies.services import get_aws_user_service
from models.aws_user import AWSUser
from schemas.user_schema import UserSchema
from dependencies.security import get_current_user
from typing import Optional, List
from fastapi.security import OAuth2PasswordBearer

outh_2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter(prefix="/aws_user", tags=["aws_user"], dependencies=[Depends(get_current_user)])

@router.get("/", response_model=List[AWSUserSchema])
async def get_aws_users(
    aws_user_service: AWSUserService = Depends(get_aws_user_service)
) -> List[AWSUserSchema]:
    """
    Get all AWS users.
    """
    aws_users = await aws_user_service.get_all_users()
    if not aws_users:
        raise HTTPException(status_code=404, detail="No AWS users found")
    return [AWSUserSchema(**user) for user in aws_users]


@router.get("/{aws_user_id}", response_model=AWSUserSchema)
async def get_aws_user(
    aws_user_id: str,
    aws_user_service: AWSUserService = Depends(get_aws_user_service)
) -> AWSUserSchema:
    """
    Get a specific AWS user by ID.
    """
    aws_user = await aws_user_service.get_user_by_id(aws_user_id)
    if not aws_user:
        raise HTTPException(status_code=404, detail="AWS user not found")
    return aws_user 



@router.post("/", response_model=AWSUserSchema)
async def create_aws_user(
    current_user: UserSchema = Depends(get_current_user),
    aws_user_service: AWSUserService = Depends(get_aws_user_service)
) -> AWSUserSchema:
    """
    Create a new AWS user.
    """
    aws_user = await aws_user_service.create_user(current_user.github_id)
    if not aws_user:
        raise HTTPException(status_code=400, detail="Failed to create AWS user")
    return aws_user