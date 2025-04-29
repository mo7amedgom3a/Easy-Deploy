from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
class AWSUser(BaseModel):
    user_github_id : str
    iam_role_arn : str
    aws_access_key_id : str
    aws_user_group : str = Field(default="deployment-users")
    aws_secret_access_key : str
    aws_account_id : str
    created_at : Optional[str] = Field(default_factory=lambda: datetime.now().isoformat())


    class Config:
        from_attributes = True
        populate_by_name = True
        use_enum_values = True
        allow_population_by_field_name = True
        arbitrary_types_allowed = True