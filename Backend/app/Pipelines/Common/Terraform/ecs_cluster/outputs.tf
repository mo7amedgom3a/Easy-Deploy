
output "ecr_repo_url" {
  value = aws_ecr_repository.app_repo.repository_url
}

output "load_balancer_dns" {
  value = aws_lb.load_balancer.dns_name
}