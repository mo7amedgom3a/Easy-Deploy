from pydantic import BaseModel, Field
from typing import Optional
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
class AWSUserSchema(BaseModel):
   
    user_github_id: str
    iam_role_arn: str
    aws_access_key_id: str
    aws_user_group: str
    aws_secret_access_key: str
    aws_account_id: str
    created_at: Optional[str] = datetime.now().isoformat()


    class Config:
        from_attributes = True
        populate_by_name = True
        orm_mode=True 
        arbitrary_types_allowed = True
        json_encoders = {
            str: lambda v: v,
        }