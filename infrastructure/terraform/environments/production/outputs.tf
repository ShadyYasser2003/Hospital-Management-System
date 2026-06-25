# =============================================================================
#  Outputs — Production Environment
# =============================================================================

# ── VPC ───────────────────────────────────────────────────────────────────────
output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs (for EKS nodes)"
  value       = module.vpc.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs (for ALB)"
  value       = module.vpc.public_subnet_ids
}

# ── ECR ───────────────────────────────────────────────────────────────────────
output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value       = module.ecr.repository_urls
}

# ── RDS ───────────────────────────────────────────────────────────────────────
output "rds_endpoint" {
  description = "RDS MySQL endpoint"
  value       = module.rds.endpoint
}

output "rds_jdbc_url" {
  description = "JDBC URL for Spring Boot DATABASE_URL"
  value       = module.rds.jdbc_url
  sensitive   = true
}

# ── ALB ───────────────────────────────────────────────────────────────────────
output "alb_dns_name" {
  description = "ALB DNS name (use for Route53 alias or CNAME)"
  value       = module.alb.alb_dns_name
}

# ── S3 ───────────────────────────────────────────────────────────────────────
output "uploads_bucket" {
  description = "S3 uploads bucket name"
  value       = module.s3.uploads_bucket_id
}

# ── ACM ───────────────────────────────────────────────────────────────────────
output "certificate_arn" {
  description = "ACM certificate ARN"
  value       = module.acm.certificate_arn
}

# ── IAM ───────────────────────────────────────────────────────────────────────
output "eks_cluster_role_arn" {
  description = "EKS cluster role ARN (for Phase 5)"
  value       = module.iam.eks_cluster_role_arn
}

output "eks_node_role_arn" {
  description = "EKS node role ARN (for Phase 5)"
  value       = module.iam.eks_node_role_arn
}
