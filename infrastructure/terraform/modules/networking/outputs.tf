output "flow_log_group" {
  description = "CloudWatch log group for VPC flow logs"
  value       = aws_cloudwatch_log_group.flow_logs.name
}

output "database_nacl_id" {
  description = "Network ACL ID for database subnets"
  value       = aws_network_acl.database.id
}
