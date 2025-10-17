output "release_name" {
  description = "The name of the Helm release"
  value       = helm_release.prometheus.name
}

output "release_namespace" {
  description = "The Kubernetes namespace where the Helm release is deployed"
  value       = helm_release.prometheus.namespace
}

output "release_status" {
  description = "The status of the Helm release"
  value       = helm_release.prometheus.status
}

# Optional: expose any important values from the Helm chart (if needed)
output "prometheus_service_url" {
  description = "URL or IP of Prometheus service, if exposed"
  # This depends on whether the chart exposes a service or ingress. 
  # You can reference related kubernetes_service resources or use helm_release attributes.
  value = "" # fill in if you manage a service in this module
}
