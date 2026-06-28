variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "model_id" {
  description = "HuggingFace model ID to deploy"
  type        = string
  default     = "Shams03/tawkeed-egy-medical-4b"
}

variable "instance_type" {
  description = "SageMaker instance type (GPU required)"
  type        = string
  default     = "ml.g4dn.xlarge"
}

variable "instance_count" {
  type    = number
  default = 1
}

variable "tags" {
  type    = map(string)
  default = {}
}
