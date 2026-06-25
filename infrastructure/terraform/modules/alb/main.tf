# =============================================================================
#  ALB Module — Application Load Balancer (infrastructure only)
#  Listeners and target groups will be configured in the EKS/K8s phase.
# =============================================================================

resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.deletion_protection

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-alb"
  })
}

# ── Target Group (placeholder — will be updated during K8s phase) ─────────────
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-tg"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/actuator/health"
    matcher             = "200"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-backend-tg"
  })
}

resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200"
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-frontend-tg"
  })
}

# NOTE: Listeners are not created in this phase.
# They will be added during the EKS/Ingress Controller phase with:
#   - HTTP → HTTPS redirect (port 80 → 443)
#   - HTTPS listener with ACM certificate (port 443)
#   - Path-based routing: / → frontend, /api → backend
