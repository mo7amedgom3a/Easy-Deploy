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

# Null resource to delete ECR images before repository deletion
resource "null_resource" "delete_ecr_images" {
  triggers = {
    ecr_repository_name = aws_ecr_repository.app_repo.name
  }

  provisioner "local-exec" {
    when    = destroy
    command = <<EOF
      aws ecr list-images \
        --repository-name ${self.triggers.ecr_repository_name} \
        --query 'imageIds[*]' \
        --output json \
        | jq -r '.[] | @base64' \
        | while read i; do
            imageId=$(echo $i | base64 --decode)
            aws ecr batch-delete-image \
              --repository-name ${self.triggers.ecr_repository_name} \
              --image-ids "$imageId"
          done
    EOF
  }
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

resource "aws_iam_role_policy" "ecs_instance_inline_policy" {
  name = "ecs-instance-ssm-policy"
  role = aws_iam_role.aws_ecs_instance_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ssm:SendCommand",
          "ssm:DescribeInstanceInformation",
          "ssm:GetCommandInvocation", 
          "ssm:ListCommands",
          "ssm:ListCommandInvocations",
          "ssmmessages:*",
          "ec2messages:*",
          "ec2-instance-connect:SendSSHPublicKey",
          "ec2:CreateInstanceConnectEndpoint",
          "ec2:CreateNetworkInterface",
          "ec2:CreateTags",
          "iam:CreateServiceLinkedRole",
          "ec2-instance-connect:OpenTunnel"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "aws_ecs_instance_role_policy" {
  role       = aws_iam_role.aws_ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
}

resource "aws_iam_role_policy_attachment" "ecs_instance_ssm_policy" {
  role       = aws_iam_role.aws_ecs_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "aws_ecs_instance_profile" {
  name_prefix = "ecs-instance-profile-"
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

# Add inline policy for CodeBuild, ECR, and CloudWatch Logs permissions
resource "aws_iam_role_policy" "ecs_task_codebuild_policy" {
  name = "ecs-task-codebuild-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "codebuild:StartBuild",
          "ecr:*",
          "logs:FilterLogEvents"
        ],
        Resource = "*"
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
  cpu                = 512 
  memory             = 1024
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
  container_definitions = jsonencode([
    {
      name      = var.aws_ecs_task_container_name
      image     = "${aws_ecr_repository.app_repo.repository_url}:${var.image_tag}"
      cpu       = 512
      memory    = 1024
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
      authorization_config {
        iam = "ENABLED"
      }
    }
  }
}
# Define the ECS service that will run the task
resource "aws_ecs_service" "ecs_service" {
  name            = var.aws_ecs_service_name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  desired_count   = 2
  
  network_configuration {
    subnets         = [aws_subnet.private_subnet1.id, aws_subnet.private_subnet2.id]
    security_groups = [aws_security_group.ecs_tasks_sg.id]   
  }
  
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_controller {
    type = "ECS"
  }

  placement_constraints {
    type = "distinctInstance"
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