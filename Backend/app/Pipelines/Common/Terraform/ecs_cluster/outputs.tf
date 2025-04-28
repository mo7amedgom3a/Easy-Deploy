output "vpc_id" {
  value = aws_vpc.main.id
}
output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
output "ecr_repo_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

