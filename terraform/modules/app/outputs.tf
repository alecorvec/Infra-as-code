output "deployment_name" {
  description = "Name of the Kubernetes deployment"
  value       = kubernetes_deployment_v1.default.metadata[0].name
}

output "service_name" {
  description = "Name of the Kubernetes service"
  value       = kubernetes_service_v1.default.metadata[0].name
}

output "service_internal_ip" {
  description = "Internal IP address assigned to the LoadBalancer service"
  value       = kubernetes_service_v1.default.status[0].load_balancer[0].ingress[0].ip
  # This may be null initially until the service is assigned an IP.
}
