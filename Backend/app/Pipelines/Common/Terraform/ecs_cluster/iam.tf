
resource "aws_iam_user" "user" {
  name = "github-${var.user_github_id}"
}

resource "aws_iam_group" "user_group" {
  name = "github-${var.user_github_id}-group"
}

resource "aws_iam_group_membership" "user_membership" {
  name = "github-${var.user_github_id}-membership"
  users = [aws_iam_user.user.name]
  group = aws_iam_group.user_group.name
}

resource "aws_iam_role" "user_role" {
  name = "github-${var.user_github_id}-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        AWS = aws_iam_user.user.arn
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "ecs_access_policy" {
  name        = "ecs-access-${var.user_github_id}"
  description = "Allow ECS access for user ${var.user_github_id}"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecs:*",
          "ecr:*",
          "ec2:*",
          "elasticloadbalancing:*",
          "iam:GetRole",
          "iam:GetPolicy",
          "iam:ListRoles",
          "iam:ListPolicies",
          "iam:PassRole",
          "iam:GetGroup",
          "iam:ListGroups",
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "ssm:DescribeParameters",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_group_policy_attachment" "attach_policy_to_group" {
  group      = aws_iam_group.user_group.name
  policy_arn = aws_iam_policy.ecs_access_policy.arn
}

resource "aws_iam_access_key" "user_key" {
  user = aws_iam_user.user.name
}
