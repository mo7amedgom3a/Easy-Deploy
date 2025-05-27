import boto3
import os
from dotenv import load_dotenv
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class AWSCodeBuild:
    def __init__(self):
        self.codebuild = boto3.client('codebuild')
        load_dotenv()

    def start_build(self, project_name: str, ecr_repo_url: str, source_version: str, buildspec_content: str, port: int, entry_point: str, image_tag: Optional[str] = None, github_username: Optional[str] = None, repo_name: Optional[str] = None, absolute_path: Optional[str] = None):
        try:
            environment_variables_override = [
                {
                    'name': 'AWS_ACCOUNT_ID',
                    'value': os.getenv('AWS_ACCOUNT_ID')
                },
                {
                    'name': 'AWS_DEFAULT_REGION',
                    'value': os.getenv('AWS_DEFAULT_REGION')
                },
                {
                    'name': 'ECR_REPO_URL',
                    'value': ecr_repo_url
                },
                {
                    'name': 'PORT',
                    'value': str(port)
                },
                {
                    'name': 'ENTRY_POINT',
                    'value': entry_point
                },
                {
                    'name': 'IMAGE_TAG',
                    'value': image_tag or 'latest'
                },
                {
                    'name': 'GITHUB_USERNAME',
                    'value': github_username
                },
                {
                    'name': 'REPO_NAME',
                    'value': repo_name
                },
                {
                    'name': "ABSOLUTE_PATH",
                    'value': absolute_path
                }
            ]

            start_build_params = {
                'projectName': project_name,
                'environmentVariablesOverride': environment_variables_override,
                'sourceVersion': source_version,
                'buildspecOverride': buildspec_content
            }

            # Remove keys with None values
            if not buildspec_content:
                del start_build_params['buildspecOverride']

            logger.info(f"Starting CodeBuild project: {project_name}")
            try:    
                response = self.codebuild.start_build(**start_build_params)
                print(response)
            except Exception as e:
                logger.error(f"Failed to start CodeBuild: {str(e)}")
                raise Exception(f"CodeBuild start failed: {str(e)}")
            
            build_id = response.get('build', {}).get('id')
            logger.info(f"Build started with ID: {build_id}")
            
            return {
                'status': 'started',
                'build_id': build_id,
                'project_name': project_name,
                'source_version': source_version
            }

        except Exception as e:
            logger.error(f"Failed to start CodeBuild: {str(e)}")
            raise Exception(f"CodeBuild start failed: {str(e)}")