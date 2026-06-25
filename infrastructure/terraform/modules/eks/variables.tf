variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version"
  type        = string
  default     = "1.29"
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for EKS cluster and nodes"
  type        = list(string)
}

variable "cluster_role_arn" {
  description = "IAM role ARN for the EKS cluster"
  type        = string
}

variable "node_role_arn" {
  description = "IAM role ARN for the EKS managed node group"
  type        = string
}

variable "cluster_security_group_ids" {
  description = "Security group IDs for the EKS cluster"
  type        = list(string)
  default     = []
}

variable "instance_types" {
  description = "EC2 instance types for node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "capacity_type" {
  description = "Capacity type: ON_DEMAND or SPOT"
  type        = string
  default     = "ON_DEMAND"
}

variable "disk_size" {
  description = "Node disk size in GB"
  type        = number
  default     = 50
}

variable "desired_nodes" {
  type    = number
  default = 2
}

variable "min_nodes" {
  type    = number
  default = 2
}

variable "max_nodes" {
  type    = number
  default = 5
}

variable "app_namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "hms-production"
}

variable "s3_policy_arn" {
  description = "ARN of the S3 uploads policy to attach to backend IRSA"
  type        = string
}

variable "lb_controller_policy_arn" {
  description = "ARN of the AWS LB Controller IAM policy"
  type        = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
