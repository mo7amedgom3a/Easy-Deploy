# Easy Deploy Backend

## Overview

Easy Deploy Backend is a robust and scalable backend system designed to automate the deployment of applications using AWS services. It leverages Amazon ECS, ECR, CodeBuild, and other AWS components to provide a seamless CI/CD pipeline for containerized applications.
This project aims to simplify the deployment process by providing a pre-configured infrastructure that can be easily customized and extended. It supports both Fargate and EC2 launch types, allowing for flexible resource management based on workload requirements.

## Architecture

The system consists of several key components:

1. **ECS Cluster**: A scalable container orchestration service
2. **ECR Repository**: For storing Docker images
3. **CodeBuild Pipeline**: For continuous integration and deployment
4. **VPC with Public/Private Subnets**: For secure networking
5. **Application Load Balancer**: For routing traffic to containers
6. **Auto Scaling Group**: For managing EC2 instances

![Architecture Overview](images/architecture.png)

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Terraform installed (version >= 1.0.0)
- Docker installed
- Python 3.8+ (for local development)

## Project Structure

```
Backend/
├── app/                    # Application source code
│   └── Pipelines/         # CI/CD and infrastructure code
│       ├── Common/        # Shared infrastructure components
│       │   └── Terraform/ # Terraform configurations
│       └── Backend/       # Backend-specific configurations
├── terraform/             # Root Terraform configurations
├── images/               # Architecture and documentation images
└── env/                 # Environment configurations
```

## Infrastructure Components

### ECS Cluster
The ECS cluster is configured with the following key features:

- **Capacity Providers**: Uses a mix of Fargate and EC2 launch types
  - Fargate for serverless container management
  - EC2 for cost-optimized workloads

- **Task Definitions**: 
  - Defines container specifications
  - CPU and memory requirements
  - Port mappings
  - Environment variables
  - Volume mounts

- **Services**:
  - Maintains desired count of tasks
  - Handles task placement and scheduling
  - Integrates with Application Load Balancer
  - Supports rolling deployments

- **Container Instances**:
  - EC2 instances registered to the cluster
  - Managed by Auto Scaling Group
  - Runs ECS container agent
  - Reports resource availability

- **Monitoring & Logging**:
  - CloudWatch integration for metrics
  - Container insights enabled
  - Centralized logging
  - Health checks and alerts

The cluster uses placement strategies to optimize container distribution across availability zones while maintaining high availability. Task networking is handled through awsvpc mode, giving each task its own ENI and security group.

- Manages container deployments
- Supports auto-scaling
- Integrates with AWS services

![ECS Architecture](images/ecs_architecture.png)

### EFS Integration
**Source of Truth**
- Provides persistent storage across all containers and EC2 instances
- Mounted at `/mnt/repos` on EC2 instances and containers
- Automatically scales storage capacity up and down
- Supports concurrent access from multiple availability zones
- Uses NFSv4 protocol for mounting
- Configured with the following:
  - Mount target in each AZ's private subnet
  - Security group allowing NFS traffic (port 2049)
  - IAM roles and policies for ECS tasks
  - Lifecycle policies for backup and retention

Mount Process:
1. EFS mount helper installed on EC2 instances
2. Mount target created in each AZ's subnet
3. EC2 instances mount EFS to `/mnt/repos` at boot time
4. Containers mount EFS via task definition volume configuration
5. All repository data stored under `/mnt/repos/<owner>/<repo-name>`

Benefits:
- Shared storage across all deployment components
- Persistent data survives container restarts
- Automatic backups and high availability
- Elastic scaling without disruption

![EFS Integration](images/efs.png)

### Networking
- VPC with public and private subnets
  - Public subnets for internet-facing resources
  - Private subnets for internal resources
  - Custom route tables for each subnet type
  - Internet Gateway for public internet access
  - CIDR block allocation for IP addressing
- Security groups for traffic control
  - Inbound/outbound rules based on ports and protocols
  - Service-specific security groups
  - Default deny-all with explicit allows
  - Stateful packet filtering
- Load Balancer in each public subnet
  - Application Load Balancer (ALB) for HTTP/HTTPS traffic
  - Health checks and target group routing
  - SSL/TLS termination
  - Cross-zone load balancing enabled
- Network ACLs for additional security
  - Subnet-level traffic control
  - Stateless packet filtering
  - Ordered rule evaluation
- VPC Endpoints for AWS services
  - Interface endpoints for ECR, CloudWatch
  - Gateway endpoints for S3, DynamoDB
  - Reduced data transfer costs

#### NAT Gateway
- Enables outbound internet access for resources in private subnets
- Deployed in public subnets with Elastic IP
- Routes traffic from private subnets through public subnets
- Provides security by blocking inbound connections
- Automatically scales based on traffic volume
- Highly available across availability zones
![NAT Gateway](images/nat_gateway.webp)

#### EC2 Instance Connect Endpoint
- Secure way to connect to EC2 instances without public IPs
- Eliminates need for bastion hosts
- Uses AWS IAM for authentication and authorization
- Supports SSH and RDP connections
- Traffic stays within VPC network
- Provides audit logs of all connection attempts
- Regional service with automatic scaling
![ec2_instance_connect_endpoint](images/ec2_instance_connect.png)


## Deployment Process

### 1. Infrastructure Setup

1. Navigate to the Terraform directory:
   ```bash
   cd Backend/terraform
   ```

2. Initialize Terraform:
Initialize the remote backend by running setup_backend.sh script which:
- Creates an S3 bucket for storing Terraform state
- Creates a DynamoDB table for state locking
- Configures backend.tf with the created resources
- Ensures proper state management across team members
   ```bash
   terraform init
   ```

3. Apply the infrastructure:
   Apply the Terraform configuration to create all infrastructure resources:
   - Creates VPC and networking components
   - Sets up ECS cluster and services
   - Configures load balancer and target groups
   - Creates ECR repository
   - Sets up CodeBuild project and IAM roles
   - Establishes security groups and access controls
   - Provisions NAT Gateway and VPC endpoints
   - Creates EC2 Instance Connect Endpoint
   
   The --auto-approve flag skips the interactive approval step
   The --lock=false flag allows concurrent Terraform operations

   ```bash
   terraform apply --auto-approve --lock=false
   ```

### 2. Application Deployment

1. Build and push your Docker image:
   ```bash
   docker build -t your-app:latest .
   docker tag your-app:latest $ECR_REPO_URL:latest
   docker push $ECR_REPO_URL:latest
   ```

2. The CodeBuild pipeline will automatically execute the following steps:
   - Access the source code from the EFS mount point where repositories are stored
   - Install dependencies and run tests based on buildspec.yml configuration
   - Build the application using the specified entry point and port
   - Create an optimized Docker image with the application
   - Tag and push the image to Amazon ECR with a unique deployment tag
   - Update the ECS task definition with the new image
   - Deploy the updated container to ECS and configure load balancer routing
   - Monitor deployment health and roll back if needed
   - Log all build and deployment steps to CloudWatch

## CI/CD Pipeline

The system uses AWS CodeBuild for continuous integration and deployment:

1. **Build Phase**:
   - Access source code from EFS
   - Builds Docker image
   - Pushes to ECR

2. **Deploy Phase**:
   - Triggers ECS deployment
   - Updates ECS service with new task definition
   - Updates ECS task definition
   - Deploys new container
   - Updates load balancer

![CodeBuild Pipeline](images/codebuild.png)

## Security

- IAM roles and policies for least privilege access
- Security groups for network isolation
- ECR image scanning
- VPC with public/private subnet separation

## Monitoring and Maintenance

- CloudWatch integration for logs and metrics
- Auto-scaling based on CPU/memory usage
- Health checks for container instances

## Troubleshooting

### Common Issues

1. **Container Health Checks Failing**
   - Check application logs in CloudWatch
   - Verify security group configurations
   - Ensure correct port mappings

2. **Deployment Failures**
   - Check CodeBuild logs
   - Verify ECR repository access
   - Ensure sufficient IAM permissions

### Accessing Containers

You can connect to running containers using AWS Systems Manager Session Manager:

![EC2 Instance Connect](images/ec2_instance_connect.png)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request


## Contributors
- [Mohamed Gomaa](https://github.com/mo7amedgom3a)
- [Adel Kazzaz](https://github.com/Adelkazzaz)
## License

This project is licensed under the MIT License - see the LICENSE file for details.
