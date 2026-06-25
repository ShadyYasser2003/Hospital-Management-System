output "alb_security_group_id" {
  description = "Security group ID for the ALB"
  value       = aws_security_group.alb.id
}

output "backend_security_group_id" {
  description = "Security group ID for backend services"
  value       = aws_security_group.backend.id
}

output "database_security_group_id" {
  description = "Security group ID for RDS"
  value       = aws_security_group.database.id
}
