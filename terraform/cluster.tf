# CLUSTER

resource "google_container_cluster" "default" {
  name = "infra-autopilot-cluster"
  location                 = var.region
  enable_autopilot         = true
  enable_l4_ilb_subsetting = true
  network    = google_compute_network.vpc_network.id
  subnetwork = google_compute_subnetwork.main.id
  ip_allocation_policy {
    stack_type                    = "IPV4"
    services_secondary_range_name = google_compute_subnetwork.main.secondary_ip_range[0].range_name
    cluster_secondary_range_name  = google_compute_subnetwork.main.secondary_ip_range[1].range_name
  }
  deletion_protection = false
}
