import boto3
import os
from dotenv import load_dotenv
class AWSCodeBuild:
    def __init__(self):
        self.codebuild = boto3.client('codebuild')
        load_dotenv()

    def start_build(self, project_name: str, ecr_repo_url: str, source_version: str, buildspec_content: str, port: int, entry_point: str):
        environment_variables_override=[
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
            }
        ]
        start_build_params = {
            'projectName': project_name,
            'environmentVariablesOverride': environment_variables_override,
            'sourceVersion': source_version,
            'buildspecOverride': buildspec_content
        }

        # Remove keys with None values, as start_build API doesn't like them
        if not buildspec_content:
            del start_build_params['buildspecOverride'] # Use project default if not provided

        response = self.codebuild.start_build(**start_build_params)
        return response