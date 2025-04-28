variable "aws_region" {
  default = "us-east-1"
}

variable "ec2_ami" {
  # ubuntu 20.04
  default = "ami-084568db4383264d4"
  description = "AMI ID for the EC2 instance"
  type        = string
  
}

variable "public_key_path" {
  description = "Path to your public SSH key"
  default     = "~/.ssh/id_rsa.pub"
  type        = string
}


variable "private_key_path" {
  description = "Path to your private SSH key"
  default = "~/.ssh/id_rsa"
  type        = string
}
