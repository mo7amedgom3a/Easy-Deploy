from fastapi import APIRouter, Depends, HTTPException, Request
from services.deploy import DeployService
from dependencies.security import get_current_user, get_access_key_from_token_payload
from schemas.deploy_schema import DeployCreateSchema, DeploySchema, DeployUpdate
from models.deploy import Deploy
from typing import Optional, List, Dict
from schemas.user_schema import UserSchema
from dependencies.services import get_deploy_service
from dependencies.security import get_current_user, get_access_key_from_token_payload
from fastapi.security import OAuth2PasswordBearer
from services.aws_user import AWSUserService

oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/deploy", tags=["deploy"], dependencies=[Depends(get_current_user)])
@router.post("/", response_model=DeploySchema)
async def create_deploy(
    deploy: DeployCreateSchema,
    user: UserSchema = Depends(get_current_user),
    deploy_service: DeployService = Depends(get_deploy_service),
    token: str = Depends(oauth_2_scheme)
) -> Deploy:
    """
    Create a new deploy record in the database.
    """
    try:
        # Get the access key from the token payload
              
        access_token = await get_access_key_from_token_payload(token)
        
        return await deploy_service.create_deploy(deploy, access_token=access_token, user=user)
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/frameworks", response_model=Dict)
def get_frameworks(
    deploy_service: DeployService = Depends(get_deploy_service)
) -> Dict:
    """
    Get the list of supported frameworks.
    """
    try:
        return deploy_service.get_framework_config()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{owner}/{repo_name}")
async def delete_deploy(
    owner: str,
    repo_name: str,
    deploy_service: DeployService = Depends(get_deploy_service)
) -> Dict:
    """
    destroy terraform resources for repo
    """
    try:
        return await deploy_service.destroy_terraform_resources(owner, repo_name)
    except HTTPException as http_ex:
        raise http_ex