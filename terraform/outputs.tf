output "app_service_name" {
  value = module.app.service_name
}

output "prometheus_release_name" {
  value = module.monitoring.release_name
}
