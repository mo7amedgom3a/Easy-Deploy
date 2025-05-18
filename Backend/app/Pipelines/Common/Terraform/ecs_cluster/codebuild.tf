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
      name  = "ECR_REPO_URL" // Placeholder, will be overridden by start_build
      value = "placeholder_ecr_url"
      type  = "PLAINTEXT"
    }
  }

  source {
    type                = "GITHUB"
    location            = "https://github.com/${var.owner}/${var.repo_name}.git"
    git_clone_depth     = 1
    report_build_status = true
    // buildspec         = "buildspec.yml" // We will use buildspecOverride from DeployService
  }

  // If you use webhooks, you might configure them here, or manage GitHub App integration
  // webhook {
  //   filter_group {
  //     filter {
  //       type    = "EVENT"
  //       pattern = "PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED, PUSH"
  //     }
  //   }
  // }

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

  tags = {
    Name        = "${var.user_github_id}-${var.repo_name}-codebuild"
    Environment = "dev"
    CreatedBy   = "Terraform"
    GithubUser  = var.user_github_id
    RepoName    = var.repo_name
    Owner       = var.owner
  }
} 