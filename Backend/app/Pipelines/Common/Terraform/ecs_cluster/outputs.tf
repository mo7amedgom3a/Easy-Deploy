output "vpc_id" {
  value = aws_vpc.main.id
}


output "iam_role_arn" {
  value = aws_iam_role.user_role.arn
}


output "aws_access_key" {
  value = aws_iam_access_key.user_key.id
  sensitive = true
}

output "aws_secret_access_key" {
  value = aws_iam_access_key.user_key.secret
  sensitive = true
}



output "ecr_repo_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

