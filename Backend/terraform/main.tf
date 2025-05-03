# Create an ECS cluster
terraform {
  backend "s3" {
    bucket         = "my-deployment-states"
    dynamodb_table = "terraform-locks"
    encrypt        = true
    key            = "ecs-cluster/terraform.tfstate"
    region         = "us-east-1"
  }
}
provider "aws" {
  region = var.aws_region
}
data "aws_caller_identity" "current" {}


resource "aws_ecs_cluster" "ecs_cluster" {
  name = var.aws_ecs_cluster_name
}
resource "aws_ecr_repository" "app_repo" {
  name = var.repo_name
  image_scanning_configuration {
    scan_on_push = true
  }
  force_delete = true
  
}

resource "aws_iam_role" "aws_ecs_instance_role" {
  name = "ecs-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "aws_ecs_instance_role_policy" {
  role       = aws_iam_role.aws_ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_instance_profile" "aws_ecs_instance_profile" {
  name = var.aws_ecs_instance_profile_name
  role = aws_iam_role.aws_ecs_instance_role.name
}

resource "aws_ecs_capacity_provider" "aws_ecs_capacity_provider" {
  name = var.aws_ecs_capacity_provider_name

  auto_scaling_group_provider {
    auto_scaling_group_arn = aws_autoscaling_group.ecs_asg.arn

    managed_scaling {
      maximum_scaling_step_size = 1000
      minimum_scaling_step_size = 1
      status                    = "ENABLED"
      target_capacity           = 3
    }
  }
}

# IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# Attach ECS Task Execution policy
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}



resource "aws_ecs_cluster_capacity_providers" "example" {
  cluster_name = aws_ecs_cluster.ecs_cluster.name

  capacity_providers = [aws_ecs_capacity_provider.aws_ecs_capacity_provider.name]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = aws_ecs_capacity_provider.aws_ecs_capacity_provider.name
  }
}

# Define the ECS task definition for the service
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family             = var.ecs_task_family
  network_mode       = var.ecs_task_network_mode
  task_role_arn      = aws_iam_role.ecs_task_execution_role.arn
  execution_role_arn = aws_iam_role.ecs_task_execution_role.arn
  cpu                = 256
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = var.aws_ecs_task_container_name
      image     = "${aws_ecr_repository.app_repo.repository_url}:latest"
      cpu       = 256
      memory    = 512
      network_mode = "awsvpc"
      essential = true
      portMappings = [
        {
          containerPort = var.aws_ecs_task_container_port
          hostPort      = var.aws_ecs_task_host_port
          protocol      = "tcp"
          
        }
      ]
           mountPoints = [
        {
          sourceVolume  = "efs-repo-volume"
          containerPath = "/mnt/repos"
          readOnly      = false
        }
      ]
      
    }
  ])
  volume {
    name = "efs-repo-volume"
    efs_volume_configuration {
      file_system_id          = aws_efs_file_system.repo_storage.id
      transit_encryption      = "ENABLED"
      root_directory          = "/"
    }
  }
}
# Define the ECS service that will run the task
resource "aws_ecs_service" "ecs_service" {
  name            = var.aws_ecs_service_name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  desired_count   = 1
  
  network_configuration {
    subnets         = [aws_subnet.subnet.id, aws_subnet.subnet2.id]
    security_groups = [aws_security_group.security_group.id]
    
  }

  force_new_deployment = true
  placement_constraints {
    type = "distinctInstance"
  }

  triggers = {
    redeployment = timestamp()
  }

  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.aws_ecs_capacity_provider.name
    weight            = 100
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    
    container_name   = var.aws_ecs_task_container_name
    container_port   = var.aws_ecs_task_container_port
  }

  depends_on = [aws_autoscaling_group.ecs_asg]
}