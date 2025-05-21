variable "aws_region" {
  type    = string
  default = "us-east-1"
}
variable "vpc_id" {
  type        = string
  description = "VPC ID"
}
variable "public_subnet_id" {
  type        = string
  description = "Public Subnet ID"
}
variable "private_subnet_id" {
  type        = string
  description = "Private Subnet ID"
}
variable "user_github_id" {
  type        = string
  description = "GitHub ID of the user"
}
variable "public_key" {
  description = "Content of your public SSH key"
  type        = string
}


variable "private_key_path" {
  description = "Path to your private SSH key"
  default     = "~/.ssh/id_rsa"
  type        = string
}
variable "aws_access_key" {
  description = "AWS Access Key"
  type        = string
}
variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
}

variable "key_pair_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = "ecs-key-pair"
}

variable "aws_ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
  default     = "ecs-cluster"
  
}
variable "aws_target_group" {
  description = "Name of the ECS target group"
  type        = string
  default     = "ecs-target-group"
}
variable "aws_lb_name" {
  description = "Name of the ECS load balancer"
  type        = string
  default     = "ecs-load-balancer"
  
}
variable "aws_ecs_instance_profile_name" {
  description = "Name of the ECS instance profile"
  type        = string
  default     = "ecs-instance-profile"
  
}
variable "aws_security_group_name" {
  description = "Name of the security group"
  type        = string
  default     = "ecs-security-group"
  
}
variable "aws_ecs_service_name" {
  description = "Name of the ECS service"
  type        = string
  default     = "ecs-service"
}

variable "ecs_instance_role_name" {
  description = "Name of the ECS instance role"
  type        = string
  default     = "ecs-instance-role"
}

variable "ecs_instance_profile_name" {
  description = "Name of the ECS instance profile"
  type        = string
  default     = "ecs-instance-profile"
}

variable "aws_ecs_capacity_provider_name" {
  description = "Name of the ECS capacity provider"
  type        = string
  default     = "custom-capacity-provider"
}

variable "vpc_cidr" {
  description = "CIDR block for main"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type    = string
  default = "us-east-1a"
}

variable "repo_name" {
  description = "Repository name"
  type        = string
}

variable "owner" {
  description = "GitHub repository owner"
  type        = string
}

variable "source_branch" {
  description = "Source branch for the CodeBuild project (e.g., main, master)"
  type        = string
  default     = "main"
}

variable "ecs_task_family" {
  description = "Family name for the ECS task definition"
  type        = string
  default     = "my-ecs-task"
}

variable "ecs_task_network_mode" {
  description = "Network mode for the ECS task definition"
  type        = string
  default     = "awsvpc"
}


variable "aws_ecs_task_container_name" {
  description = "Name of the container in the ECS task definition"
  type        = string
  default     = "dockergs"
}

variable "ecs_task_container_port" {
  description = "Container port for the ECS task definition"
  type        = number
}

variable "ecs_task_host_port" {
  description = "Host port for the ECS task definition"
  type        = number

}

variable "ecs_task_protocol" {
  description = "Protocol for the ECS task definition port mapping"
  type        = string
  default     = "tcp"
}
locals {
  aws_region = var.aws_region
  vpc_id = var.vpc_id
  public_subnet_id = var.public_subnet_id
  private_subnet_id = var.private_subnet_id
  user_github_id = var.user_github_id
  aws_access_key = var.aws_access_key
  aws_secret_access_key = var.aws_secret_access_key

  
  public_key = var.public_key
  private_key_path = var.private_key_path
  
  aws_ecs_cluster_name = "${var.aws_ecs_cluster_name}-${var.user_github_id}"
  aws_target_group = "${var.aws_target_group}-${var.user_github_id}"
  aws_lb_name = "${var.aws_lb_name}-${var.user_github_id}"
  aws_ecs_instance_profile_name = "${var.aws_ecs_instance_profile_name}-${var.user_github_id}"
  aws_security_group_name = "${var.aws_security_group_name}-${var.user_github_id}"
  aws_ecs_service_name = "${var.aws_ecs_service_name}-${var.user_github_id}"
  ecs_instance_role_name = "${var.ecs_instance_role_name}-${var.user_github_id}"
  ecs_instance_profile_name = "${var.ecs_instance_profile_name}-${var.user_github_id}"
  aws_ecs_capacity_provider_name = "${var.aws_ecs_capacity_provider_name}-${var.user_github_id}"
  ecs_task_family = "${var.ecs_task_family}-${var.user_github_id}"
  }