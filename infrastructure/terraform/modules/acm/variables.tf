variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "domain_name" {
  description = "Primary domain name for the certificate"
  type        = string
}

variable "subject_alternative_names" {
  description = "Additional domain names (SANs)"
  type        = list(string)
  default     = []
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID for DNS validation (empty = skip auto-validation)"
  type        = string
  default     = ""
}

variable "tags" {
  type    = map(string)
  default = {}
}
