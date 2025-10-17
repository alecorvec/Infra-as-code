output "vpc_network_id" {
  description = "The ID of the VPC network"
  value       = google_compute_network.vpc_network.id
}

output "vpc_network_name" {
  description = "The name of the VPC network"
  value       = google_compute_network.vpc_network.name
}

output "subnetwork_id" {
  description = "The ID of the subnetwork"
  value       = google_compute_subnetwork.main.id
}

output "subnetwork_name" {
  description = "The name of the subnetwork"
  value       = google_compute_subnetwork.main.name
}

output "subnetwork_region" {
  description = "The region of the subnetwork"
  value       = google_compute_subnetwork.main.region
}

output "secondary_ip_range_services" {
  description = "The services secondary IP range CIDR block"
  value       = google_compute_subnetwork.main.secondary_ip_range[0]
}

output "secondary_ip_range_pods" {
  description = "The pods secondary IP range CIDR block"
  value       = google_compute_subnetwork.main.secondary_ip_range[1]
}
