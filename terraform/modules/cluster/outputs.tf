output "cluster_endpoint" {
  description = "The IP address of the cluster master"
  value       = google_container_cluster.default.endpoint
}

output "cluster_ca_certificate" {
  description = "The base64 encoded public certificate used by clients to authenticate to the cluster endpoint"
  value       = google_container_cluster.default.master_auth[0].cluster_ca_certificate
}

output "name" {
  description = "The name of the cluster"
  value       = google_container_cluster.default.name
}

output "location" {
  description = "The location (region or zone) of the cluster"
  value       = google_container_cluster.default.location
}
