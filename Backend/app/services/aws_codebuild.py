import boto3
import os
import json

class AWSCodeBuild:
    def __init__(self):
        self.codebuild = boto3.client('codebuild')

    def start_build(self, project_name):
        response = self.codebuild.start_build(
            projectName=project_name,
            environmentVariablesOverride=[
                {
                    'name': 'AWS_ACCOUNT_ID',
                    'value': os.environ.get('AWS_ACCOUNT_ID')
                },
                { 
                    'name': 'AWS_DEFAULT_REGION',
                    'value': os.environ.get('AWS_DEFAULT_REGION')
                },
                {
                    'name': 'IMAGE_REPO_NAME',
                    'value': os.environ.get('IMAGE_REPO_NAME')
                }
                
           
        )
        return response