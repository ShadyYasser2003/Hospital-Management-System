output "eks_cluster_role_arn" {
  description = "ARN of the EKS cluster IAM role"
  value       = aws_iam_role.eks_cluster.arn
}

output "eks_node_role_arn" {
  description = "ARN of the EKS node group IAM role"
  value       = aws_iam_role.eks_nodes.arn
}

output "s3_uploads_policy_arn" {
  description = "ARN of the S3 uploads access policy"
  value       = aws_iam_policy.s3_uploads.arn
}

output "rds_access_policy_arn" {
  description = "ARN of the RDS/Secrets Manager access policy"
  value       = aws_iam_policy.rds_access.arn
}
