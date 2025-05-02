output "vpc_id" {
  value = aws_vpc.main.id
}
output "ecr_repo_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

