provider "aws" {
  region = var.aws_region
}


# Optional: This can be used to identify the current account ID
data "aws_caller_identity" "current" {}

# IAM user, group, role, and access key logic is in iam.tf
# No additional resources here for now

