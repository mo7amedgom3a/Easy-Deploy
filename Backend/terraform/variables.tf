variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "public_key_path" {
  description = "Path to your public SSH key"
  default     = "~/.ssh/id_rsa.pub"
  type        = string
}

variable "private_key_path" {
  description = "Path to your private SSH key"
  default = "~/.ssh/id_rsa"
  type        = string
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
  description = "Name of the ECR repository"
  type        = string
  default     = "easy-deploy-repo"
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

variable "aws_ecs_task_container_port" {
  description = "Container port for the ECS task definition"
  type        = number
  default = 8000
  
}

variable "aws_ecs_task_host_port" {
  description = "Host port for the ECS task definition"
  type        = number
  default = 8000
  
}

variable "ecs_task_protocol" {
  description = "Protocol for the ECS task definition port mapping"
  type        = string
  default     = "tcp"
}

variable "image_tag" {
  description = "The tag of the Docker image to deploy"
  type        = string
  default     = "latest"
}