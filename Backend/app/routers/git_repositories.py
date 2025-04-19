from fastapi import APIRouter, Depends, HTTPException


from services.git_repository import GitRepositoryService
from dependencies.security import get_current_user, get_access_key_from_token_payload
from schemas.repository import RepositorySchema
from typing import Optional, List
from dependencies.services import get_git_repository_service
from fastapi.security import OAuth2PasswordBearer

outh_2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/git", tags=["git"], dependencies=[Depends(get_current_user)])

@router.get("/repository/{owner}", response_model=List[RepositorySchema])
async def get_repositories(
    owner: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Fetches the repositories of the authenticated user.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        repositories = await git_repository_service.fetch_user_repositories(owner=owner, access_token=access_key)
        return [RepositorySchema(**repo) for repo in repositories]

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repository/{owner}/{repo_name}", response_model=None)  # Removed trailing slash
async def get_repository(
    owner: str,
    repo_name: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Fetches a specific repository by its name.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        repository = await git_repository_service.fetch_repository(owner=owner, repo_name=repo_name, access_token=access_key)
        if "error" in repository:
            raise HTTPException(status_code=400, detail=repository["error"])
        return repository

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repository/{owner}/{repo_name}", response_model=None)  # Removed trailing slash
async def save_repo(
    owner: str,
    repo_name: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Saves a specific repository by its name.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        repository = await git_repository_service.fetch_repository(owner=owner, repo_name=repo_name, access_token=access_key)
        if "error" in repository:
            raise HTTPException(status_code=400, detail=repository["error"])
        saved_repo = await git_repository_service.save_repo(owner=owner, repo=repository)
        return saved_repo

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)
    )

@router.get("/repository/{owner}/{repo_name}/commits/{branch}", response_model=None)  # Removed trailing slash
async def get_latest_commit(
    owner: str,
    repo_name: str,
    branch: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Fetches the latest commit from a specific branch of a repository.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        commit = await git_repository_service.get_latest_commit(owner=owner, repo_name=repo_name, branch=branch, access_token=access_key)
        if "error" in commit:
            raise HTTPException(status_code=400, detail=commit["error"])
        return commit

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    
# get tree structure with sha
@router.get("/repository/{owner}/{repo_name}/blobs/{branch}/{sha}", response_model=None)  # Removed trailing slash
async def get_blob_tree(
    owner: str,
    repo_name: str,
    branch: str,
    sha: Optional[str] = None,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Fetches the blob tree structure of a repository.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        blob_tree = await git_repository_service.get_blob_tree(owner=owner, repo_name=repo_name, branch=branch, sha=sha, access_token=access_key)
        if "error" in blob_tree:
            raise HTTPException(status_code=400, detail=blob_tree["error"])
        return blob_tree

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))