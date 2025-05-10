data "aws_ssm_parameter" "ecs_ami" {
  name = "/aws/service/ecs/optimized-ami/amazon-linux-2/recommended/image_id"
}

resource "aws_key_pair" "deployer_key" {
  key_name   = "deployer-key"
  public_key = file(var.public_key_path)
}
resource "aws_launch_template" "ecs_lt" {
  name_prefix   = "ecs-template"
  key_name     = aws_key_pair.deployer_key.key_name 

  image_id = data.aws_ssm_parameter.ecs_ami.value
  instance_type = "t2.micro"
  
  
  vpc_security_group_ids = [aws_security_group.ecs_tasks_sg.id]
  iam_instance_profile {
    name = aws_iam_instance_profile.aws_ecs_instance_profile.name
  }
  

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ecs-instance"
    }
  }

  user_data = base64encode(<<EOF
              #!/bin/bash
              mkdir -p /etc/ecs
              echo ECS_CLUSTER=${aws_ecs_cluster.ecs_cluster.name} >> /etc/ecs/ecs.config
              EOF
  )
  
}
resource "aws_ec2_instance_connect_endpoint" "ecs_instance_connect_endpoint" {
  subnet_id = aws_subnet.public_subnets[0].id
  security_group_ids = [aws_security_group.ecs_tasks_sg.id]
  preserve_client_ip = false
  tags = {
    Name = "eic-endpoint"
  }
}
resource "aws_autoscaling_group" "ecs_asg" {
  vpc_zone_identifier = aws_subnet.private_subnets[*].id
  desired_capacity    = 2
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
resource "aws_lb" "ecs_alb" {
  name               = var.aws_lb_name
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets = aws_subnet.public_subnets[*].id

  tags = {
    Name = "ecs-alb"
  }
}

resource "aws_lb_listener" "ecs_alb_listener" {
  load_balancer_arn = aws_lb.ecs_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ecs_tg.arn
    
  }
}

resource "aws_lb_target_group" "ecs_tg" {
  name        = var.aws_target_group
  port        = var.aws_ecs_task_container_port
  protocol    = "HTTP"
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
