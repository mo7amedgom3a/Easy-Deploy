from repositories.deploy import DeployRepository
from models.deploy import Deploy
from schemas.deploy_schema import DeployCreateSchema, DeploySchema, DeployUpdate
import re
class DeployService:
    def __init__(self, deploy_repository: DeployRepository):
        self.deploy_repository = deploy_repository
        self.frameworks =  {
            "flask": {
                "port": "5000",
                "entry_point": "app.py",
                "build_command": "pip install -r requirements.txt",
                "run_command": "python app.py"
            },
            "django": {
                "port": "8000",
                "entry_point": "manage.py",
                "build_command": "pip install -r requirements.txt",
                "run_command": "python manage.py runserver"
            },
            "fastapi": {
                "port": "8000",
                "entry_point": "main.py",
                "build_command": "pip install -r requirements.txt",
                "run_command": "uvicorn main:app --reload"
            }
        }
        self.supported_frameworks = list(self.frameworks.keys())


    async def create_deploy(self, deploy: DeployCreateSchema) -> Deploy:
        """
        Create a new deploy record in the database.
        """
        # Verify if the specified framework is supported
        if deploy.framework not in self.supported_frameworks:
            raise ValueError(f"Unsupported framework: {deploy.framework}. Supported frameworks are: {self.supported_frameworks}")

        # Get framework-specific configuration
        framework_config = self.frameworks[deploy.framework.lower()]

        # Use provided values or defaults from the framework configuration
        build_command = deploy.build_command or framework_config["build_command"]
        
        port = deploy.port or framework_config["port"]
        entry_point = deploy.app_entry_point or framework_config["entry_point"]
        run_command = deploy.run_command or framework_config["run_command"]
        
        
        # Create deploy object with validated data
        deploy_data = deploy.dict()
        deploy_data.update({
            "build_command": build_command,
            "run_command": run_command,
            "port": port,
            "entry_point": entry_point
        })


        print(f"Creating deploy with data: {deploy_data}")
        

        print("Deploy creation initiated.")

        return await self.deploy_repository.create_deploy(Deploy(**deploy_data))
        