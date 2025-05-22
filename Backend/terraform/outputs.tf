output "vpc_id" {
  value = aws_vpc.main.id
}
output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
output "nat_ip" {
  value = aws_eip.nat_eip.public_ip
}
output "ecr_repo_url" {
  value = aws_ecr_repository.app_repo.repository_url
}
# load balancer dns
output "load_balancer_dns" {
  value = aws_lb.ecs_alb.dns_name
}
# efs id
output "efs_id" {
  value = aws_efs_file_system.repo_storage.id
}


# shared puplic subnet
output "public_subnet_id" {
  value = aws_subnet.public_subnet_shared.id
}

# shared private subnet
output "private_subnet_id" {
  value = aws_subnet.private_subnet_shared.id
}

