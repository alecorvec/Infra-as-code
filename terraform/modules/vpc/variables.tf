variable "project_id" {
  type        = string
  description = "Cloud project ID"
  default = "test-infra-dev"
}

variable "region" {
  type        = string
  description = "Region for resources"
  default = "europe-west2"
}

variable "vpc_name" {
  type        = string
  description = "Name of the VPC"
  default = "vpc"
}

variable "cidr_block" {
  type        = string
  default = "10.10.0.0/20"
  description = "CIDR block for the VPC"
}

variable "subnet_cidr" {
  type        = string
  description = "CIDR du sous-réseau"
  default     = "10.0.1.0/24"
}
