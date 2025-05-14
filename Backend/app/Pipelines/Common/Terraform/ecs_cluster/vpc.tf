resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "main-${var.user_github_id}-vpc"
  }
}

# ------------------------------------------
# Internet Gateway
# ------------------------------------------
resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "${var.user_github_id}-igw"
  }
}

# ------------------------------------------
# Public Subnet and Routing
# ------------------------------------------
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, 1)
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1a"
  
  tags = {
    Name = "${var.user_github_id}-public-subnet"
  }
}

resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.internet_gateway.id
  }
  
  tags = {
    Name = "${var.user_github_id}-public-route-table"
  }
}

resource "aws_route_table_association" "public_route_association" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}

# ------------------------------------------
# Private Subnet and Routing
# ------------------------------------------
resource "aws_subnet" "private_subnet1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, 2)
  availability_zone = "us-east-1a"
  
  tags = {
    Name = "${var.user_github_id}-private-subnet"
  }
}

# NAT Gateway for private subnet internet access
resource "aws_eip" "nat_eip" {
  vpc = true
  
  tags = {
    Name = "${var.user_github_id}-nat-eip"
  }
}
resource "aws_nat_gateway" "nat_gateway" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet.id
  depends_on    = [aws_internet_gateway.internet_gateway]
  
  tags = {
    Name = "${var.user_github_id}-nat-gateway"
  }
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat_gateway.id
  }
  
  tags = {
    Name = "${var.user_github_id}-private-route-table"
  }
}

resource "aws_route_table_association" "private_route_association" {
  subnet_id      = aws_subnet.private_subnet1.id
  route_table_id = aws_route_table.private_route_table.id
}

# ------------------------------------------
# Security Group
# ------------------------------------------
resource "aws_security_group" "security_group" {
  name   = var.aws_security_group_name
  vpc_id = aws_vpc.main.id

  # Allow SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow SSH access"
  }
  
  # Allow HTTP traffic and container port access
  ingress {
    from_port   = 80
    to_port     = var.ecs_task_container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP and container traffic"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  
  tags = {
    Name = "${var.user_github_id}-sg"
  }
}

# Security group for EC2 Instance Connect endpoint
resource "aws_security_group" "eic_endpoint_sg" {
  name   = "eic-endpoint-sg"
  vpc_id = aws_vpc.main.id

  # Allow inbound traffic from anywhere
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow inbound traffic from anywhere"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }
  tags = {
    Name = "${var.user_github_id}-eic-endpoint-sg"
  }
}
