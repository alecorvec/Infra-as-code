variable "cluster_endpoint" {
  description = "Endpoint of the GKE cluster to connect to"
  type        = string
}

variable "cluster_ca_certificate" {
  description = "Base64 encoded certificate for the GKE cluster"
  type        = string
}

variable "token" {
  description = "Authentication token to connect to the Kubernetes cluster"
  type        = string
}
