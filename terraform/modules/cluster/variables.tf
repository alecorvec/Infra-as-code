variable "region" {
  description = "Region where the GKE cluster will be created"
  type        = string
}

variable "network" {
  description = "The ID of the VPC network to associate with the cluster"
  type        = string
}

variable "subnetwork" {
  description = "The ID of the subnetwork to associate with the cluster"
  type        = string
}

variable "services_secondary_range_name" {
  description = "The name of the secondary range used for services"
  type        = string
}

variable "cluster_secondary_range_name" {
  description = "The name of the secondary range used for pods"
  type        = string
}

variable "project_id" {
  description = "The ID of the project where the GKE cluster will be created"
  type        = string
}
