# ------------------------------------------
# VPC and Internet Gateway
# ------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main"
  }
}

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "internet-gateway"
  }
}

# ------------------------------------------
# Public Subnets and Routing
# ------------------------------------------
resource "aws_subnet" "public_subnets" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 1)
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1${count.index == 0 ? "a" : "b"}"

  tags = {
    Name = "public-subnet-${count.index + 1}" # ex public-subnet-1, public-subnet-2
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }

  tags = {
    Name = "public-route-table"
  }
}

resource "aws_route_table_association" "public_route_associations" {
  count          = 2
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_route_table.id
}

# ------------------------------------------
# Private Subnets and Routing
# ------------------------------------------
resource "aws_subnet" "private_subnets" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index + 3)
  availability_zone = "us-east-1${count.index == 0 ? "a" : "b"}"
  
  tags = {
    Name = "private-subnet-${count.index + 1}" # ex private-subnet-1, private-subnet-2
  }
}

# NAT Gateway for private subnet internet access
resource "aws_eip" "nat_eip" {
  domain = "vpc"
  tags = {
    Name = "nat-eip"
  }
}

resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnets[0].id
  depends_on    = [aws_internet_gateway.internet_gateway]
  
  tags = {
    Name = "nat-gateway"
  }
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }

  tags = {
    Name = "private-route-table"
  }
}

resource "aws_route_table_association" "private_route_associations" {
  count          = 2
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_route_table.id
}

# ------------------------------------------
# Security Groups
# ------------------------------------------
resource "aws_security_group" "alb_sg" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP traffic"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-sg"
  }
}

resource "aws_security_group" "ecs_tasks_sg" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port       = var.aws_ecs_task_container_port
    to_port         = var.aws_ecs_task_host_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allow traffic from ALB"
  }
  # Allow HTTP traffic from ALB to target group
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allow HTTP traffic from ALB"
  }
   ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
    description     = "Allow ALB to access ECS EC2 instances"
  }
  # mongoDB access
  ingress {
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.security_group.id]
    description     = "Allow MongoDB access"
  }
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.security_group.id]
    description     = "Allow SSH access"
  }
  # Egress rules
  egress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    security_groups = [aws_security_group.security_group.id]
    description = "Allow outbound MongoDB access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "ecs-tasks-sg"
  }
}

resource "aws_security_group" "security_group" {
  name   = var.aws_security_group_name
  vpc_id = aws_vpc.main.id

  # Ingress rules
  ingress {
    from_port   = 22
    to_port     = 22  
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH"
  }

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow MongoDB access"
  }

  # Egress rules
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name = "ecs-sg"
  }
}