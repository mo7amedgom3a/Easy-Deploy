resource "aws_efs_file_system" "repo_storage" {
  creation_token = "github-repo-efs"
  performance_mode = "generalPurpose"
  throughput_mode = "bursting"
  tags = {
    Name = "repo-efs"
  }
}
resource "aws_security_group" "efs_sg" {
  name        = "efs-sg"
  description = "Allow NFS access to EFS"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "Allow NFS access from VPC"
    from_port   = 2049
    to_port     = 2049
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.main.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "efs-sg"
  }
}

# resource "aws_efs_mount_target" "subnet1" {
#   file_system_id  = aws_efs_file_system.repo_storage.id
#   subnet_id       = aws_subnet.private_subnet1.id
#   security_groups = [aws_security_group.efs_sg.id]
# }

resource "aws_efs_mount_target" "subnet2" {
  file_system_id  = aws_efs_file_system.repo_storage.id
  subnet_id       = aws_subnet.private_subnet2.id
  security_groups = [aws_security_group.efs_sg.id]

}
resource "aws_efs_mount_target" "subnet3" {
  file_system_id  = aws_efs_file_system.repo_storage.id
  subnet_id       = aws_subnet.private_subnet_shared.id
  security_groups = [aws_security_group.efs_sg.id]
}