# =============================================================================
#  RDS Module — Managed MySQL for the Hospital Management System
# =============================================================================

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-mysql"

  # Engine
  engine               = "mysql"
  engine_version       = var.engine_version
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true

  # Database
  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  port     = 3306

  # Network
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false
  multi_az               = var.multi_az

  # Backup & Maintenance
  backup_retention_period = var.backup_retention_period
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot   = true
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.project_name}-${var.environment}-final-snapshot"

  # Monitoring
  monitoring_interval          = 60
  monitoring_role_arn          = var.monitoring_role_arn
  performance_insights_enabled = true

  # Parameters
  parameter_group_name = aws_db_parameter_group.main.name

  # Deletion protection (enable in production)
  deletion_protection = var.deletion_protection

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-mysql"
  })
}

resource "aws_db_parameter_group" "main" {
  name_prefix = "${var.project_name}-${var.environment}-mysql-"
  family      = "mysql8.0"
  description = "HMS MySQL 8.0 parameter group"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }

  parameter {
    name  = "slow_query_log"
    value = "1"
  }

  tags = var.tags

  lifecycle {
    create_before_destroy = true
  }
}

# ── Enhanced Monitoring IAM Role ─────────────────────────────────────────────
resource "aws_iam_role" "rds_monitoring" {
  name = "${var.project_name}-${var.environment}-rds-monitoring"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  role       = aws_iam_role.rds_monitoring.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}
