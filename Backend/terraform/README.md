# AWS Infrastructure Architecture

This repository contains Terraform configurations for deploying a scalable and secure AWS infrastructure. The architecture is designed to support containerized applications using Amazon ECS (Elastic Container Service).

## Architecture Overview

### Network Infrastructure
- **VPC**: A custom VPC with public and private subnets across two availability zones (us-east-1a and us-east-1b)
- **Subnets**:
  - Public Subnets (2): For internet-facing resources
  - Private Subnets (2): For ECS tasks and other internal resources
  - Additional shared subnets for multi-users usage
- **Internet Gateway**: For public internet access
- **NAT Gateways**: Two NAT gateways for private subnet internet access
- **Route Tables**: Separate routing configurations for public and private subnets

### Container Infrastructure
- **ECS Cluster**: A dedicated cluster for running containerized applications
- **ECR Repository**: For storing Docker container images
- **ECS Capacity Provider**: Auto-scaling configuration for the ECS cluster
- **ECS Task Definition**: Defines container specifications and resource requirements
- **ECS Service**: Manages the desired number of tasks and their deployment

### Compute Resources
- **Auto Scaling Group**: Manages EC2 instances for the ECS cluster
- **Launch Template**: Defines EC2 instance configuration
- **Instance Connect Endpoint**: For secure SSH access to instances

### Storage
- **EFS (Elastic File System)**: 
  - Shared file storage mounted to ECS tasks
  - Mount targets in private subnets
  - Security group for NFS access

### Load Balancing
- **Application Load Balancer (ALB)**:
  - Internet-facing load balancer
  - HTTP listener on port 80
  - Target group for ECS tasks
  - Health check configuration

### Security
- **Security Groups**:
  - ALB Security Group: Allows HTTP traffic
  - ECS Tasks Security Group: Controls container access
  - EFS Security Group: Manages NFS access
  - Instance Connect Endpoint Security Group
- **IAM Roles and Policies**:
  - ECS Instance Role
  - ECS Task Execution Role
  - Custom policies for SSM, ECR, and CloudWatch access

### State Management
- **S3 Backend**: Terraform state stored in S3 bucket
- **DynamoDB**: State locking mechanism

## Key Features
1. High Availability: Multi-AZ deployment
2. Scalability: Auto-scaling for both EC2 and ECS
3. Security: Private subnets, security groups, and IAM roles
4. Persistence: EFS for shared storage
5. Monitoring: Health checks and CloudWatch integration
6. Access Management: Instance Connect for secure SSH access

## Prerequisites
- AWS CLI configured with appropriate credentials
- Terraform installed
- SSH key pair for instance access

## Usage
1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Review the execution plan:
   ```bash
   terraform plan
   ```

3. Apply the configuration:
   ```bash
   terraform apply
   ```

## Variables
Key variables that can be customized:
- `aws_region`: AWS region for deployment
- `vpc_cidr`: CIDR block for the VPC
- `aws_ecs_cluster_name`: Name of the ECS cluster
- `aws_ecs_task_container_port`: Container port for the application
- `aws_lb_name`: Name of the Application Load Balancer

## Cleanup
To destroy the infrastructure:
```bash
terraform destroy
```

Note: This will delete all resources created by this Terraform configuration.
