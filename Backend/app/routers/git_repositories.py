from fastapi import APIRouter, Depends, HTTPException, Request
from services.git_repository import GitRepositoryService
from services.deploy import DeployService
from services.aws_codebuild import AWSCodeBuild
from dependencies.security import get_current_user, get_access_key_from_token_payload
from schemas.repository import RepositorySchema
from models.deploy import Deploy
from schemas.deploy_schema import DeploySchema
from typing import Optional, List
from schemas.user_schema import UserSchema
from dependencies.services import get_git_repository_service, get_deploy_service, get_aws_codebuild
from fastapi.security import OAuth2PasswordBearer
import logging
import os

outh_2_scheme = OAuth2PasswordBearer(tokenUrl="token")
router = APIRouter(prefix="/git", tags=["git"])

logger = logging.getLogger(__name__)
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
    
@router.post("/repository/webhook/")  
async def github_webhook(
    request: Request,
    git_repository_service: GitRepositoryService = Depends(get_git_repository_service),
    deploy_service: DeployService = Depends(get_deploy_service),
    aws_codebuild: AWSCodeBuild = Depends(get_aws_codebuild)
):
    """Handle GitHub webhook events for repository updates"""
    try:
        payload = await request.json()
        
        # Verify this is a push event
        if payload.get("ref") and payload.get("repository"):
            owner = payload["repository"]["owner"]["login"]
            repo_name = payload["repository"]["name"]
            
            # Pull the latest changes
            result = await git_repository_service.pull_repository(
                owner=owner,
                repo_name=repo_name,
                access_token=None  # No token needed for webhook operations
            )
            
            if "error" in result:
                logger.error(f"Failed to pull repository: {result['error']}")
                return {"status": "error", "message": result["error"]}
            
            # Get deploy data
            deploys = await deploy_service.get_deploys(owner, repo_name)
            if deploys:
                # Get the latest deploy
                latest_deploy = deploys[0]  # Assuming deploys are ordered by creation date desc
                
                # Start CodeBuild process
                codebuild_project_name = f"{latest_deploy.user_github_id}-{latest_deploy.repo_name}-codebuild"
                source_branch_for_codebuild = getattr(latest_deploy, 'branch', 'main')

                # Read buildspec content
                if not latest_deploy.absolute_path:
                    raise HTTPException(status_code=400, detail="Repository path is required")
                buildspec_file_path = os.path.join(latest_deploy.absolute_path, "buildspec.yml")
                buildspec_content = ""
                if os.path.exists(buildspec_file_path):
                    with open(buildspec_file_path, "r") as f:
                        buildspec_content = f.read()
                else:
                    logger.warning(f"buildspec.yml not found at {buildspec_file_path}. CodeBuild might use project default.")

                # Validate required deploy parameters
                if not latest_deploy.ecr_repo_url:
                    raise HTTPException(status_code=400, detail="ECR repository URL is required")
                if not latest_deploy.port:
                    raise HTTPException(status_code=400, detail="Port is required")
                if not latest_deploy.app_entry_point:
                    raise HTTPException(status_code=400, detail="App entry point is required")

                logger.info(f"Starting CodeBuild project: {codebuild_project_name} for ECR repo: {latest_deploy.ecr_repo_url} on branch {source_branch_for_codebuild}")
                build_response = aws_codebuild.start_build(
                    project_name=codebuild_project_name,
                    ecr_repo_url=latest_deploy.ecr_repo_url,
                    source_version=source_branch_for_codebuild,
                    buildspec_content=buildspec_content,
                    port=latest_deploy.port,
                    entry_point=latest_deploy.app_entry_point,
                    image_tag="latest",
                    github_username=latest_deploy.owner,
                    repo_name=latest_deploy.repo_name,
                    absolute_path=latest_deploy.absolute_path
                )
                print(f"CodeBuild started: {build_response}")

            return {
                "status": "success",
                "message": "Repository updated successfully",
                "details": result
            }
        else:
            return {"status": "ignored", "message": "Not a push event"}
            
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
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
        
        # Check if the response is an error dictionary
        if isinstance(repositories, dict) and "error" in repositories:
            raise HTTPException(status_code=400, detail=repositories.get("error", "Unknown error"))
            
        # Convert list of dicts to list of RepositorySchema
        return [RepositorySchema(**repo) for repo in repositories]

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
        if sha is None:
            raise HTTPException(status_code=400, detail="SHA parameter is required")
        blob_tree = await git_repository_service.get_blob_tree(owner=owner, repo_name=repo_name, branch=branch, sha=sha, access_token=access_key)
        if isinstance(blob_tree, dict) and "error" in blob_tree:
            raise HTTPException(status_code=400, detail=blob_tree.get("error", "Unknown error"))
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
