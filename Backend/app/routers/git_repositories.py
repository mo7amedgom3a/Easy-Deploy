from fastapi import APIRouter, Depends, HTTPException, Request
from services.git_repository import GitRepositoryService
from dependencies.security import get_current_user, get_access_key_from_token_payload
from schemas.repository import RepositorySchema
from typing import Optional, List
from schemas.user_schema import UserSchema
from dependencies.services import get_git_repository_service
from fastapi.security import OAuth2PasswordBearer

outh_2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/git", tags=["git"])


@router.post("/repository/github-webhook")  
async def github_webhook(
    request: Request
):
    """ trigger github webhook for user repository """
    
    try:
        payload = await request.json()
        
        if payload.get("ref"):
            owner = payload["repository"]["owner"]["login"]
            repo_name = payload["repository"]["name"]
            # Use direct authentication or a configured service token instead of user token
            
    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"message": "Webhook received successfully "}
        
@router.get("/repository/{owner}", response_model=List[RepositorySchema], dependencies=[Depends(get_current_user)])
async def get_repositories(
    owner: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
) -> List[RepositorySchema]:
    """
    Fetches the repositories of the authenticated user.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        repositories = await git_repository_service.fetch_user_repositories(owner=owner, access_token=access_key)
        if "error" in repositories:
            raise HTTPException(status_code=400, detail=repositories["error"])
        return repositories

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/repository/{owner}/{repo_name}", response_model=None, dependencies=[Depends(get_current_user)])
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


@router.post("/repository/{owner}/{repo_name}", response_model=None, dependencies=[Depends(get_current_user)])
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

@router.get("/repository/{owner}/{repo_name}/commits/{branch}", response_model=None, dependencies=[Depends(get_current_user)])
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
    
# trigger github webhook for user 
@router.post("/repository/{owner}/{repo_name}/webhook", response_model=None)
async def create_webhook(
    owner: str,
    repo_name: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Creates a webhook for a specific repository.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        result = await git_repository_service.create_github_webhook(owner=owner, repo_name=repo_name, access_token=access_key)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# get tree structure with sha
@router.get("/repository/{owner}/{repo_name}/blobs/{branch}/{sha}", response_model=None, dependencies=[Depends(get_current_user)])
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

# create github webhook

@router.post("/repository/{owner}/{repo_name}/clone", response_model=None, dependencies=[Depends(get_current_user)])
async def clone_repository(
    owner: str,
    repo_name: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Clones a repository to the local filesystem.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        result = await git_repository_service.clone_repository(owner=owner, repo_name=repo_name, access_token=access_key)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/repository/{owner}/{repo_name}/pull", response_model=None, dependencies=[Depends(get_current_user)])
async def pull_repository(
    owner: str,
    repo_name: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    
    """
    Pulls the latest changes for a cloned repository.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        result = await git_repository_service.pull_repository(owner=owner, repo_name=repo_name, access_token=access_key)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/toreposiry/{owner}/tree", response_model=None, dependencies=[Depends(get_current_user)])
async def get_tree_directory(
    owner: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Fetches the tree directory for a repository.
    """
    try:
        # Get the access key from the token payload
        access_key = await get_access_key_from_token_payload(token)
        result = await git_repository_service.get_tree_directory(owner=owner, access_token=access_key)
        
        return result

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/repository/{owner}/{repo_name}", response_model=None, dependencies=[Depends(get_current_user)])
async def delete_repository(
    owner: str,
    repo_name: str,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    token: str = Depends(outh_2_scheme)
):
    """
    Deletes a repository from the local filesystem.
    """
    try:
        result = await git_repository_service.delete_repo(owner=owner, repo_name=repo_name)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result

    except HTTPException as http_ex:
        raise http_ex
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
