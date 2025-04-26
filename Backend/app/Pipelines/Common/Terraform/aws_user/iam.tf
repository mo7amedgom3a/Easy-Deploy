# Create IAM group
resource "aws_iam_group" "deployment_group" {
  name = "deployment-users"
}


# Create IAM user
resource "aws_iam_user" "user" {
  name = "github-user-${var.user_github_id}"
}

# Add user to group
resource "aws_iam_user_group_membership" "membership" {
  user = aws_iam_user.user.name
  groups = [aws_iam_group.deployment_group.name]
}

# IAM role (to be assumed by services or GitHub)
resource "aws_iam_role" "user_role" {
  name = "github-role-${var.user_github_id}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = ["ec2.amazonaws.com", "ecr.amazonaws.com", "ecs.amazonaws.com", ]
      },
      Action = "sts:AssumeRole"
    }]
  })
}

# Attach policy (e.g., EC2/S3/ECR access)
resource "aws_iam_role_policy" "user_policy" {
  name = "github-policy-${var.user_github_id}"
  role = aws_iam_role.user_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:ListBucket",
          "ec2:DescribeInstances",
          "ecr:GetAuthorizationToken"
        
        ],
        Resource = "*"
      }
    ]
  })
}

# Create access key
resource "aws_iam_access_key" "user_key" {
  user = aws_iam_user.user.name
}

