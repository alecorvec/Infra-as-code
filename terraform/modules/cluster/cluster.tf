# CLUSTER

locals {
  gke_cluster_name = "infra-standard-cluster"
}

resource "google_container_cluster" "default" {
  name = "infra-autopilot-cluster"
  location                 = var.region
  enable_autopilot         = true
  enable_l4_ilb_subsetting = true
  network    = var.network
  subnetwork = var.subnetwork
  ip_allocation_policy {
    stack_type                    = "IPV4"
    services_secondary_range_name = var.services_secondary_range_name
    cluster_secondary_range_name  = var.cluster_secondary_range_name
  }
  deletion_protection = false
}

# RETOUR PROF A SETUP :
# gke promotheus manager (à la place de la ressources dans monitoring)
# HPA (et les nodes)
