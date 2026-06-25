# =============================================================================
#  Input Variables — Production Environment
# =============================================================================

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project identifier used in resource naming"
  type        = string
  default     = "hms"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

# ── Database ──────────────────────────────────────────────────────────────────
variable "database_username" {
  description = "RDS master username"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

variable "rds_instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ for RDS"
  type        = bool
  default     = true
}

# ── SSL / Domain ─────────────────────────────────────────────────────────────
variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "hms.example.com"
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID (empty = skip DNS validation)"
  type        = string
  default     = ""
}
