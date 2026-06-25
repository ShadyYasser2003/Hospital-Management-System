output "endpoint" {
  description = "RDS endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
}

output "address" {
  description = "RDS hostname"
  value       = aws_db_instance.main.address
}

output "port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "database_name" {
  description = "Database name"
  value       = aws_db_instance.main.db_name
}

output "jdbc_url" {
  description = "JDBC connection URL for Spring Boot"
  value       = "jdbc:mysql://${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
}

output "monitoring_role_arn" {
  description = "ARN of the RDS monitoring role"
  value       = aws_iam_role.rds_monitoring.arn
}
