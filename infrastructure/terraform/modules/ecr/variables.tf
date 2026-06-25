variable "project_name" {
  description = "Project name prefix for repository names"
  type        = string
}

variable "repository_names" {
  description = "List of ECR repository names to create"
  type        = list(string)
  default     = ["backend", "frontend"]
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {}
}
