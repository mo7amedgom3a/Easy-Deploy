resource "aws_codebuild_project" "main" {
  name          = "${var.user_github_id}-${var.repo_name}-codebuild"
  description   = "CodeBuild project for ${var.user_github_id}/${var.repo_name}"
  service_role  = aws_iam_role.codebuild_role.arn
  build_timeout = "30" // minutes

  artifacts {
    type                = "S3"
    location            = aws_s3_bucket.codebuild_artifacts.bucket
    path                = "${var.repo_name}-builds/${var.user_github_id}"
    name                = "artifacts.zip" // This is the name of the artifact CodeBuild produces in S3
    packaging           = "ZIP"
    encryption_disabled = false // Recommended to keep encryption enabled
    override_artifact_name = true // Allows buildspec to define artifact names, useful if buildspec produces multiple files like imageDetail.json
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0" // Using a standard image with Docker support
    type                        = "LINUX_CONTAINER"
    privileged_mode             = true // Required for Docker builds within CodeBuild
    image_pull_credentials_type = "CODEBUILD"

    // Environment variables defined here are defaults. 
    // They will be overridden by those provided in the start_build API call from DeployService.
    environment_variable {
      name  = "AWS_ACCOUNT_ID"
      value = data.aws_caller_identity.current.account_id 
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "AWS_DEFAULT_REGION"
      value = var.aws_region
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "ECR_REPO_URL"
      value = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.repo_name}-${var.user_github_id}"
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "PORT"
      value = tostring(var.ecs_task_container_port)
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "ENTRY_POINT"
      value = "app.py"
      type  = "PLAINTEXT" 
    }
    environment_variable {
      name  = "IMAGE_TAG"
      value = "latest"
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "GITHUB_USERNAME"
      value = var.user_github_id
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "REPO_NAME"
      value = var.repo_name
      type  = "PLAINTEXT"
    }
    environment_variable {
      name  = "ABSOLUTE_PATH"
      value = var.absolute_path
      type  = "PLAINTEXT"
    }
  }

  source {
    type            = "NO_SOURCE"
    buildspec       = file("buildspec.yml")
   
  }

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/${var.user_github_id}-${var.repo_name}-codebuild"
      stream_name = "${var.user_github_id}-${var.repo_name}"
    }
    s3_logs {
      status   = "DISABLED" // Or enable if you want logs also in S3
      # location = "${aws_s3_bucket.codebuild_artifacts.id}/build-logs"
    }
  }

  vpc_config {
    vpc_id             = var.vpc_id
    subnets            = [var.efs_mount_target_subnet1_id, var.efs_mount_target_subnet2_id]
    security_group_ids = [aws_security_group.codebuild_sg.id, var.efs_sg_id]
  }

  file_system_locations {
    type = "EFS"
    location = "${var.efs_id}.efs.${var.aws_region}.amazonaws.com:/"
    mount_point = "/mnt/repos"
    identifier = "repo-efs"
    mount_options = "nfsvers=4.1,rsize=1048576,wsize=1048576,hard,timeo=600,retrans=2"
  }

  tags = {
    Name        = "${var.user_github_id}-${var.repo_name}-codebuild"
    Environment = "dev"
    CreatedBy   = "Terraform"
    GithubUser  = var.user_github_id
    RepoName    = var.repo_name
    Owner       = var.owner
  }
}