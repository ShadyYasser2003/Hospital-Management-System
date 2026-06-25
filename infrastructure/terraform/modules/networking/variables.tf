variable "vpc_id" {
  type = string
}

variable "vpc_cidr" {
  type = string
}

variable "database_subnet_ids" {
  type = list(string)
}

variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "tags" {
  type    = map(string)
  default = {}
}
