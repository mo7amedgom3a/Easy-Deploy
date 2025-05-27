resource "aws_security_group" "codebuild_sg" {
  name        = "${var.user_github_id}-${var.repo_name}-codebuild-sg"
  description = "Security group for CodeBuild project"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    security_groups = [var.efs_sg_id]
    description = "Allow NFS access from EFS"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = {
    Name        = "${var.user_github_id}-${var.repo_name}-codebuild-sg"
    Environment = "dev"
    CreatedBy   = "Terraform"
    GithubUser  = var.user_github_id
    RepoName    = var.repo_name
  }
} 