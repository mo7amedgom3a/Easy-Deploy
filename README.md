# Easy Deploy Backend

## Overview

Easy Deploy is a SaaS (Software as a Service) platform that simplifies application deployment on AWS, designed for developers who want to focus on building great applications without worrying about DevOps or cloud infrastructure. Our platform handles all the complex AWS setup, containerization, and deployment processes automatically.

Key benefits:
- **Zero DevOps Knowledge Required**: Deploy your applications without understanding AWS, containers, or infrastructure
- **Automated Infrastructure**: We handle all AWS resource provisioning and management
- **Secure by Default**: Built-in security best practices for your applications
- **Scalable Architecture**: Applications automatically scale based on demand
- **Cost-Effective**: Pay only for the resources your application actually uses

## Presentation Demo

[View our presentation demo](https://www.canva.com/design/DAGn6hhSknA/9GhKBx_eepPrItouJhsnlg/edit?utm_content=DAGn6hhSknA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

## How It Works

### Our CI/CD Pipeline vs Your Application Pipeline

Easy Deploy uses two distinct CI/CD pipelines:

1. **Platform CI/CD Pipeline** (GitHub Actions):
   - Manages the Easy Deploy platform itself
   - Builds and deploys platform updates
   - Handles infrastructure changes
   - Ensures platform reliability and security

![Platform CI/CD Pipeline](images/cicd_pipline.png)

2. **Application CI/CD Pipeline** (AWS CodeBuild):
   - Manages your application deployments
   - Builds your application container
   - Pushes to Amazon ECR
   - Deploys to ECS
   - Handles application updates

![Application Deployment Pipeline](images/codebuild.png)

### Deployment Process

When you deploy an application through Easy Deploy, the following process occurs:

1. **AWS User Setup**:
   - System checks if you have an AWS user account
   - If not, creates a new IAM user with necessary permissions
   - Sets up secure access credentials
   - Configures user-specific AWS resources

![AWS User Setup](images/aws_user.png)

2. **Repository Setup**:
   - Clones your GitHub repository
   - Stores it in a secure EFS (Elastic File System) location
   - Copies pre-configured pipeline templates
   - Sets up build and deployment configurations

![Repository Setup](images/setup_user_repo.png)

3. **Application Deployment**:
   - CodeBuild accesses your code from EFS
   - Builds your application container
   - Pushes the image to ECR
   - Deploys the container to ECS
   - Configures load balancing and auto-scaling
   - Stores build artifacts in S3

![Application Deployment](images/deploy_app.png)

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
