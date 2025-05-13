data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}
resource "aws_key_pair" "deployer_key" {
  key_name   = "deployer-key-${var.user_github_id}"
  public_key = file(var.public_key_path)
}
resource "aws_launch_template" "ecs_lt" {
  name_prefix   = "ecs-template-${var.user_github_id}"
  image_id = data.aws_ssm_parameter.ecs_ami.value
  instance_type = "t2.micro"
  key_name     = aws_key_pair.deployer_key.key_name
  
  vpc_security_group_ids = [aws_security_group.security_group.id]
  iam_instance_profile {
    name = aws_iam_instance_profile.aws_ecs_instance_profile.name
  }
  

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ecs-instance-${var.user_github_id}"
    }
  }

  user_data = base64encode(<<EOF
              #!/bin/bash
              mkdir -p /etc/ecs
              echo ECS_CLUSTER=${aws_ecs_cluster.ecs_cluster.name} >> /etc/ecs/ecs.config
              EOF
  )
  
}

resource "aws_autoscaling_group" "ecs_asg" {
  pc_zone_videntifier = [aws_subnet.subnet.id]
  desired_capacity    = 1
  max_size            = 2
  min_size            = 1

  launch_template {
    id      = aws_launch_template.ecs_lt.id
    version = "$Latest"
  }

  tag {
    key                 = "AmazonECSManaged"
    value               = "true"
    propagate_at_launch = true
  }
}

//Alb
resource "aws_lb" "ecs_nlb" {
  name               = var.aws_lb_name
  internal           = false
  load_balancer_type = "network"
  security_groups    = [aws_security_group.security_group.id]
  subnets = [aws_subnet.subnet.id]

  tags = {
    Name = "ecs-nlb-${var.user_github_id}"
  }
}

resource "aws_lb_listener" "ecs_nlb_listener" {
  load_balancer_arn = aws_lb.ecs_nlb.arn
  port              = 80
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    
  }

  depends_on = [
    aws_lb.ecs_nlb
  ]
}

resource "aws_lb_target_group" "ecs_tg" {
  name        = var.aws_target_group
  port        = 5000
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = aws_vpc.main.id

  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold  = 2
    unhealthy_threshold = 2
  }
}



