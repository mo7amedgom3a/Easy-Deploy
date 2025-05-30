# from fastapi import APIRouter, Depends, HTTPException, Query
# from datetime import datetime, timedelta
# from typing import Optional
# from services.monitoring import MonitoringService
# from services.deploy import DeployService
# from repositories.deploy import DeployRepository
# from repositories.aws_user import AWSUserRepository
# from repositories.git_repository import GitRepository
# from services.aws_user import AWSUserService
# from services.git_repository import GitRepositoryService
# from schemas.user_schema import UserSchema
# from routers.auth import get_current_user
# from dependencies.database_connection import DatabaseConnection

# router = APIRouter(
#     prefix="/monitoring",
#     tags=["monitoring"]
# )

# def get_monitoring_service():
#     return MonitoringService()

# async def get_deploy_service():
#     db = DatabaseConnection()
#     await db.connect()
#     deploy_repository = DeployRepository(db)
#     aws_user_repository = AWSUserRepository(db)
#     git_repository = GitRepository(db)
#     aws_user_service = AWSUserService(aws_user_repository)
#     git_repository_service = GitRepositoryService(git_repository)
#     return DeployService(deploy_repository, aws_user_service, git_repository_service)

# @router.get("/cluster/{cluster_name}")
# async def get_cluster_metrics(
#     cluster_name: str,
#     start_time: Optional[datetime] = Query(None),
#     end_time: Optional[datetime] = Query(None),
#     monitoring_service: MonitoringService = Depends(get_monitoring_service),
#     current_user: UserSchema = Depends(get_current_user)
# ):
#     """Get metrics for an ECS cluster."""
#     try:
#         metrics = await monitoring_service.get_cluster_metrics(
#             cluster_name=cluster_name,
#             start_time=start_time,
#             end_time=end_time
#         )
#         return metrics
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/service/{cluster_name}/{service_name}")
# async def get_service_metrics(
#     cluster_name: str,
#     service_name: str,
#     start_time: Optional[datetime] = Query(None),
#     end_time: Optional[datetime] = Query(None),
#     monitoring_service: MonitoringService = Depends(get_monitoring_service),
#     current_user: UserSchema = Depends(get_current_user)
# ):
#     """Get metrics for an ECS service."""
#     try:
#         metrics = await monitoring_service.get_service_metrics(
#             cluster_name=cluster_name,
#             service_name=service_name,
#             start_time=start_time,
#             end_time=end_time
#         )
#         return metrics
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/task/{cluster_name}/{task_id}")
# async def get_task_metrics(
#     cluster_name: str,
#     task_id: str,
#     start_time: Optional[datetime] = Query(None),
#     end_time: Optional[datetime] = Query(None),
#     monitoring_service: MonitoringService = Depends(get_monitoring_service),
#     current_user: UserSchema = Depends(get_current_user)
# ):
#     """Get metrics for a specific ECS task."""
#     try:
#         metrics = await monitoring_service.get_task_metrics(
#             cluster_name=cluster_name,
#             task_id=task_id,
#             start_time=start_time,
#             end_time=end_time
#         )
#         return metrics
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/service/{cluster_name}/{service_name}/status")
# async def get_service_status(
#     cluster_name: str,
#     service_name: str,
#     monitoring_service: MonitoringService = Depends(get_monitoring_service),
#     current_user: UserSchema = Depends(get_current_user)
# ):
#     """Get current status of an ECS service."""
#     try:
#         status = await monitoring_service.get_service_status(
#             cluster_name=cluster_name,
#             service_name=service_name
#         )
#         if 'error' in status:
#             raise HTTPException(status_code=404, detail=status['error'])
#         return status
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/deployment/{owner}/{repo_name}")
# async def get_deployment_metrics(
#     owner: str,
#     repo_name: str,
#     start_time: Optional[datetime] = Query(None),
#     end_time: Optional[datetime] = Query(None),
#     monitoring_service: MonitoringService = Depends(get_monitoring_service),
#     deploy_service: DeployService = Depends(get_deploy_service),
#     current_user: UserSchema = Depends(get_current_user)
# ):
#     """Get metrics for a specific deployment."""
#     try:
#         # Get deployment details
#         deploy = await deploy_service.get_deploy(repo_name, owner)
#         if not deploy:
#             raise HTTPException(status_code=404, detail="Deployment not found")

#         # Get service metrics
#         service_metrics = await monitoring_service.get_service_metrics(
#             cluster_name=f"{current_user.github_id}-{repo_name}-cluster",
#             service_name=f"{current_user.github_id}-{repo_name}-service",
#             start_time=start_time,
#             end_time=end_time
#         )

#         # Get service status
#         service_status = await monitoring_service.get_service_status(
#             cluster_name=f"{current_user.github_id}-{repo_name}-cluster",
#             service_name=f"{current_user.github_id}-{repo_name}-service"
#         )

#         return {
#             'metrics': service_metrics,
#             'status': service_status,
#             'deployment': {
#                 'load_balancer_url': deploy.load_balancer_url,
#                 'ecr_repo_url': deploy.ecr_repo_url,
#                 'status': deploy.status
#             }
#         }
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e)) 