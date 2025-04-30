from fastapi import APIRouter, Depends, HTTPException, Request
from services.deploy import DeployService
from dependencies.security import get_current_user, get_access_key_from_token_payload
from schemas.deploy_schema import DeployCreateSchema, DeploySchema, DeployUpdate
from models.deploy import Deploy
from typing import Optional, List, Dict
from dependencies.services import get_deploy_service
from fastapi.security import OAuth2PasswordBearer

oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/deploy", tags=["deploy"], dependencies=[Depends(get_current_user)])
@router.post("/", response_model=DeploySchema)
async def create_deploy(
    deploy: DeployCreateSchema,
    deploy_service: DeployService = Depends(get_deploy_service),
    token: str = Depends(oauth_2_scheme)
) -> Deploy:
    """
    Create a new deploy record in the database.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        return await deploy_service.create_deploy(deploy)
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)
)
