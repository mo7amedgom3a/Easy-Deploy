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
  name_prefix = "ecs-instance-profile-easy-deploy"
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
  name = "ecs-task-execution-role-${var.repo_name}"

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
  network_mode       = "awsvpc"
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
      image     = "${aws_ecr_repository.app_repo.repository_url}:latest"
      cpu       = 512
      memory    = 1024
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
     
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_log_group.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
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

# EventBridge rule for ECR image push events
resource "aws_cloudwatch_event_rule" "ecr_push_event" {
  name        = "ecr-push-event-${var.repo_name}"
  description = "Trigger ECS service update when new image is pushed to ECR"

  event_pattern = jsonencode({
    source      = ["aws.ecr"]
    detail-type = ["ECR Image Action"]
    detail = {
      action-type     = ["PUSH"]
      repository-name = [aws_ecr_repository.app_repo.name]
      image-tag       = ["latest"]
    }
  })
}

# EventBridge target for ECS service update
resource "aws_cloudwatch_event_target" "ecs_service_update" {
  rule      = aws_cloudwatch_event_rule.ecr_push_event.name
  target_id = "UpdateECSService"
  arn       = aws_ecs_cluster.ecs_cluster.arn
  role_arn  = aws_iam_role.eventbridge_role.arn

  ecs_target {
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.ecs_task_definition.arn
    launch_type         = "EC2"
  }
}

# IAM role for EventBridge to update ECS service
resource "aws_iam_role" "eventbridge_role" {
  name = "eventbridge-ecs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

# IAM policy for EventBridge to update ECS service
resource "aws_iam_role_policy" "eventbridge_ecs_policy" {
  name = "eventbridge-ecs-policy"
  role = aws_iam_role.eventbridge_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecs:RunTask",
          "ecs:StopTask",
          "ecs:DescribeTasks",
          "ecs:ListTasks",
          "ecs:DescribeServices",
          "ecs:UpdateService"
        ]
        Resource = "*"
      }
    ]
  })
}

# Update ECS service to enable automatic deployment
resource "aws_ecs_service" "ecs_service" {
  name            = var.aws_ecs_service_name
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  desired_count   = 2
  
  capacity_provider_strategy {
    capacity_provider = aws_ecs_capacity_provider.aws_ecs_capacity_provider.name
    weight           = 100
  }
  
  network_configuration {
    subnets          = [aws_subnet.private_subnet1.id, aws_subnet.private_subnet2.id]
    security_groups  = [aws_security_group.ecs_tasks_sg.id]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    container_name   = var.aws_ecs_task_container_name
    container_port   = var.aws_ecs_task_container_port
  }
  force_new_deployment = true
  placement_constraints {
    type = "distinctInstance"
  }

  triggers = {
   redeployment = timestamp()
 }

  depends_on = [
    aws_lb_listener.ecs_alb_listener,
    aws_iam_role_policy_attachment.ecs_task_execution_role_policy
  ]
}

resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name              = "/ecs/${var.ecs_task_family}"
  retention_in_days = 30
}

resource "aws_iam_role_policy" "ecs_task_execution_role_policy" {
  name = "ecs-task-execution-role-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "*"
      }
    ]
  })
}