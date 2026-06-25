variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "engine_version" {
  description = "MySQL engine version"
  type        = string
  default     = "8.0"
}

variable "instance_class" {
  description = "RDS instance type"
  type        = string
  default     = "db.t3.medium"
}

variable "allocated_storage" {
  description = "Initial storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum storage autoscaling limit in GB"
  type        = number
  default     = 100
}

variable "database_name" {
  description = "Name of the default database"
  type        = string
  default     = "hms_backend"
}

variable "database_username" {
  description = "Master username"
  type        = string
  sensitive   = true
}

variable "database_password" {
  description = "Master password"
  type        = string
  sensitive   = true
}

variable "db_subnet_group_name" {
  description = "DB subnet group name"
  type        = string
}

variable "security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "backup_retention_period" {
  description = "Backup retention in days"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "monitoring_role_arn" {
  description = "IAM role ARN for enhanced monitoring (leave empty to use module-created role)"
  type        = string
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
