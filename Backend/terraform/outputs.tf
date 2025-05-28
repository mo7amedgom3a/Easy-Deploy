output "vpc_id" {
  value = aws_vpc.main.id
}
output "account_id" {
  value = data.aws_caller_identity.current.account_id
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
output "efs_sg_id" {
  value = aws_security_group.efs_sg.id
}


# shared puplic subnet
output "public_subnet_id" {
  value = aws_subnet.public_subnet_shared.id
}

# shared private subnet
output "private_subnet_id" {
  value = aws_subnet.private_subnet_shared.id
}
output "efs_mount_target_subnet1_id" {
  description = "EFS Mount Target Subnet ID 1"
  value = aws_subnet.private_subnet1.id
}

output "efs_mount_target_subnet2_id" {
  description = "EFS Mount Target Subnet ID 2"
  value = aws_subnet.private_subnet2.id
}
