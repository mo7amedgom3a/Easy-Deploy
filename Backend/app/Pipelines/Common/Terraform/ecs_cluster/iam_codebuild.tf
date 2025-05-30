resource "aws_iam_role" "codebuild_role" {
  name = "${var.user_github_id}-${var.repo_name}-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.user_github_id}-${var.repo_name}-codebuild-role"
    Environment = "dev" // Or your desired environment
    CreatedBy   = "Terraform"
    GithubUser  = var.user_github_id
    RepoName    = var.repo_name
  }
}

resource "aws_iam_policy" "codebuild_policy" {
  name        = "${var.user_github_id}-${var.repo_name}-codebuild-policy"
  description = "Policy for CodeBuild project ${var.user_github_id}-${var.repo_name}"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = [
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/codebuild/${var.user_github_id}-${var.repo_name}-codebuild:*",
          "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/codebuild/${var.user_github_id}-${var.repo_name}-codebuild"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeNetworkInterfaces",
          "ec2:CreateNetworkInterface",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeNetworkInterfaceAttribute",
          "ec2:ModifyNetworkInterfaceAttribute",
          "ec2:AttachNetworkInterface",
          "ec2:DetachNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses",
          "ec2:DescribeDhcpOptions",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeVpcClassicLink",
          "ec2:DescribeVpcClassicLinkDnsSupport",
          "ec2:DescribeVpcPeeringConnections",
          "ec2:DescribeVpcEndpoints",
          "ec2:DescribeVpcEndpointServices",
          "ec2:DescribeVpcEndpointConnections",
          "ec2:DescribeVpcEndpointServiceConfigurations",
          "ec2:DescribeVpcEndpointServicePermissions",
          "ec2:DescribeVpcEndpointConnections",
          "ec2:DescribeVpcEndpointServiceConfigurations",
          "ec2:DescribeVpcEndpointServicePermissions",
          "ec2:DescribeVpcEndpointServices",
          "ec2:DescribeVpcEndpoints",
          "ec2:DescribeVpcPeeringConnections",
          "ec2:DescribeVpcClassicLinkDnsSupport",
          "ec2:DescribeVpcClassicLink",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeDhcpOptions"
        ],
        Resource = "*",
        Condition = {
          StringEquals = {
            "ec2:AuthorizedService": "codebuild.amazonaws.com"
          }
        }
      },
      {
        Effect = "Allow",
        Action = [
          "ec2:DescribeNetworkInterfaces",
          "ec2:DescribeNetworkInterfaceAttribute"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:*"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:GetLoginPassword"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:GetObjectVersion",
          "s3:GetBucketAcl",
          "s3:GetBucketLocation"
        ],
        Resource = [
          aws_s3_bucket.codebuild_artifacts.arn,
          "${aws_s3_bucket.codebuild_artifacts.arn}/*"
        ]
      },
      {
        Effect = "Allow",
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientWrite",
          "elasticfilesystem:ClientRootAccess",
          "elasticfilesystem:DescribeMountTargets",
          "elasticfilesystem:DescribeFileSystems"
        ],
        Resource = "arn:aws:elasticfilesystem:${var.aws_region}:${data.aws_caller_identity.current.account_id}:file-system/${var.efs_id}"
      }
    ]
  })

  tags = {
    Name        = "${var.user_github_id}-${var.repo_name}-codebuild-policy"
    Environment = "dev"
    CreatedBy   = "Terraform"
  }
}

resource "aws_iam_role_policy_attachment" "codebuild_role_policy_attach" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = aws_iam_policy.codebuild_policy.arn
}

resource "aws_iam_role_policy_attachment" "codebuild_admin_policy" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

resource "aws_iam_role_policy_attachment" "ecr_full_access" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess"
}

resource "aws_iam_role_policy_attachment" "efs_client_write_policy" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonElasticFileSystemClientFullAccess"
}

resource "aws_iam_role_policy_attachment" "ecr_power_user_policy" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}

data "aws_caller_identity" "current" {}