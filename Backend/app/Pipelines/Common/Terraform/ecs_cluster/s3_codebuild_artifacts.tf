resource "aws_s3_bucket" "codebuild_artifacts" {
  bucket = "${var.user_github_id}-${var.repo_name}-codebuild-artifacts-${data.aws_caller_identity.current.account_id}" // Unique bucket name

  tags = {
    Name        = "${var.user_github_id}-${var.repo_name}-codebuild-artifacts"
    Environment = "dev"
    CreatedBy   = "Terraform"
    GithubUser  = var.user_github_id
    RepoName    = var.repo_name
  }
}

resource "aws_s3_bucket_ownership_controls" "codebuild_artifacts_ownership" {
  bucket = aws_s3_bucket.codebuild_artifacts.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "codebuild_artifacts_public_access" {
  bucket                  = aws_s3_bucket.codebuild_artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

// Optional: Lifecycle rule to clean up old artifacts
resource "aws_s3_bucket_lifecycle_configuration" "codebuild_artifacts_lifecycle" {
  bucket = aws_s3_bucket.codebuild_artifacts.id

  rule {
    id     = "cleanup-old-artifacts"
    status = "Enabled"

    expiration {
      days = 30 // Or your desired retention period
    }

    noncurrent_version_expiration {
      noncurrent_days = 15
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
} 