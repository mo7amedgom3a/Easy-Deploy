# ------------------------------------------
# Data Sources
# ------------------------------------------
# data "aws_vpc" "main" {
#   tags = {
#     Name = "main"
#   }
# }

# # Subnet data sources
# data "aws_subnets" "private" {
#   filter {
#     name   = "vpc-id"
#     values = [data.aws_vpc.main.id]
#   }

#   filter {
#     name   = "tag:Name" 
#     values = ["*private*"]
#   }
# }

# data "aws_subnets" "public" {
#   filter {
#     name   = "vpc-id"
#     values = [data.aws_vpc.main.id]
#   }

#   filter {
#     name   = "tag:Name"
#     values = ["*public*"]
#   }
# }

# data "aws_subnet" "private" {
#   for_each = toset(data.aws_subnets.private.ids)
#   id       = each.value
# }

# data "aws_subnet" "public" {
#   for_each = toset(data.aws_subnets.public.ids)
#   id       = each.value
# }

# locals {
#   private_subnet_ids = [for subnet in data.aws_subnet.private : subnet.id]
#   public_subnet_ids  = [for subnet in data.aws_subnet.public : subnet.id]
# }

# ------------------------------------------
# VPC Resources
# ------------------------------------------
# resource "aws_vpc" "shared" {
#   cidr_block           = "10.0.0.0/16"
#   enable_dns_hostnames = true
#   enable_dns_support   = true

#   tags = {
#     Name = "Easy-Deploy-Shared-VPC"
#   }
# }

# ------------------------------------------
# Internet Gateway Resources
# ------------------------------------------
# resource "aws_internet_gateway" "internet_gateway" {
#   vpc_id = data.aws_vpc.main.id
  
#   tags = {
#     Name = "Easy-Deploy-IGW"
#   }
# }

# resource "aws_internet_gateway" "shared" {
#   vpc_id = data.aws_vpc.main.id
  
#   tags = {
#     Name = "Easy-Deploy-Shared-IGW"
#   }
# }

# ------------------------------------------
# Subnet Resources
# ------------------------------------------
# resource "aws_subnet" "public_subnet" {
#   vpc_id                  = data.aws_vpc.main.id
#   cidr_block              = cidrsubnet(data.aws_vpc.main.cidr_block, 8, 1)
#   map_public_ip_on_launch = true
#   availability_zone       = "us-east-1a"
  
#   tags = {
#     Name = "Easy-Deploy-Public-Subnet"
#   }
# }

# resource "aws_subnet" "private_subnet1" {
#   vpc_id            = data.aws_vpc.main.id
#   cidr_block        = cidrsubnet(data.aws_vpc.main.cidr_block, 8, 2)
#   availability_zone = "us-east-1a"
  
#   tags = {
#     Name = "Easy-Deploy-Private-Subnet"
#   }
# }

# # ------------------------------------------
# # Route Table Resources
# # ------------------------------------------
# resource "aws_route_table" "public_route_table" {
#   vpc_id = data.aws_vpc.main.id
  
#   route {
#     cidr_block = "0.0.0.0/0"
#     gateway_id = aws_internet_gateway.internet_gateway.id
#   }
  
#   tags = {
#     Name = "Easy-Deploy-Public-Route-Table"
#   }
# }

# resource "aws_route_table" "private_route_table" {
#   vpc_id = data.aws_vpc.main.id
  
#   tags = {
#     Name = "Easy-Deploy-Private-Route-Table"
#   }
# }

# resource "aws_route_table_association" "public_route_association" {
#   subnet_id      = aws_subnet.public_subnet.id
#   route_table_id = aws_route_table.public_route_table.id
# }

# resource "aws_route_table_association" "private_route_association" {
#   subnet_id      = aws_subnet.private_subnet1.id
#   route_table_id = aws_route_table.private_route_table.id
# }
# load balancer
resource "aws_lb" "load_balancer" {
  name               = "${var.user_github_id}-${var.repo_name}-lb"
  internal           = false
  load_balancer_type = "network"
  subnets            = [var.public_subnet_id]

  tags = {
    Name = "${var.user_github_id}-${var.repo_name}-lb"
  }
}

resource "aws_lb_listener" "ecs_nlb_listener" {
  load_balancer_arn = aws_lb.load_balancer.arn
  port              = 80
  protocol          = "TCP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
  }
}




# ------------------------------------------
# Security Group Resources
# ------------------------------------------
resource "aws_security_group" "security_group" {
  name        = "${var.user_github_id}-${var.repo_name}-sg"
  description = "Main security group for ECS deployment"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH access"
  }
  
  ingress {
    from_port   = 80
    to_port     = var.ecs_task_container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP and container traffic"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  
  tags = {
    Name = "${var.user_github_id}-${var.repo_name}-sg"
  }
}

resource "aws_security_group" "eic_endpoint_sg" {
  name        = "${var.user_github_id}-${var.repo_name}-eic-endpoint-sg"
  description = "Security group for EC2 Instance Connect endpoint"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow inbound traffic from anywhere"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "${var.user_github_id}-${var.repo_name}-eic-endpoint-sg"
  }
}


