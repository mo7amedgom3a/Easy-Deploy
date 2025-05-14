from repositories.aws_user import AWSUserRepository

from models.aws_user import AWSUser
from schemas.aws_user_schema import AWSUserSchema
from typing import List, Optional
from schemas.user_schema import UserSchema
from python_terraform import Terraform
from fastapi import HTTPException
import httpx
import json 

import os
from dotenv import load_dotenv
class AWSUserService:
    def __init__(self, aws_user: AWSUserRepository):
        self.aws_user = aws_user
        terraform_path = os.path.join(os.path.dirname(__file__), "..", "Pipelines", "Common", "Terraform", "iam")
        self.tf = Terraform(working_dir=terraform_path)
        load_dotenv()

    async def get_all_users(self) -> List[AWSUserSchema]:
        users = await self.aws_user.get_all_users()
        return users

    async def get_user_by_id(self, user_id: str) -> AWSUserSchema:
        user = await self.aws_user.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return AWSUserSchema.from_orm(user)

    async def create_user(self, github_id: str) -> AWSUserSchema:

        # check if user already exists
        existing_user = await self.aws_user.get_user(github_id)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        

        
        # Prepare Terraform variables
        vars = {
            "user_github_id": github_id,
        }

        # Run Terraform init
        print("Initializing...")
        return_code, stdout, stderr = self.tf.init(capture_output=False)
        if return_code != 0:
            raise HTTPException(status_code=500, detail="Failed to initialize Terraform")

        # Apply with vars (auto-approve)
        print("Applying Terraform...")
        return_code, stdout, stderr = self.tf.apply(skip_plan=True, var=vars, capture_output=False, auto_approve=True)
        if return_code != 0:
            raise HTTPException(status_code=500, detail="Failed to apply Terraform configuration")

        # Get output in JSON format
        print("Getting output...")
        output = self.tf.output(json=True)
        print("Terraform output:", output)
    
        if not output:
            raise HTTPException(status_code=500, detail="Failed to get Terraform output")
        
        # Create a new AWSUser object with Terraform outputs
        current_user = AWSUser(
            user_github_id=github_id,
            aws_access_key_id=output.get("aws_access_key", {}).get("value"),
            aws_secret_access_key=output.get("aws_secret_access_key", {}).get("value"),
            aws_account_id=output.get("aws_account_id", {}).get("value"),
            iam_role_arn=output.get("iam_role_arn", {}).get("value"),
        )
        created_user = await self.aws_user.create_user(current_user)
        if not created_user:
            raise HTTPException(status_code=500, detail="Failed to create user in database")
        
        return AWSUserSchema.from_orm(created_user)


    async def update_user(self, user_id: str, user: AWSUser) -> Optional[AWSUserSchema]:
        existing_user = await self.aws_user.get_user(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        updated_user = await self.aws_user.update_user(user)
        return AWSUserSchema.from_orm(updated_user)


    async def delete_user(self, user_id: str) -> bool:
        existing_user = await self.aws_user.get_user(user_id)
        if not existing_user:
            raise HTTPException(status_code=404, detail="User not found")
        return await self.aws_user.delete_user(existing_user.user_github_id)