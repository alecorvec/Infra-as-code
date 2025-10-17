terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }
  backend "gcs" {

  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "google_client_config" "default" {}

provider "kubernetes" {
  host                   = "https://${module.cluster.cluster_endpoint}"
  token                  = data.google_client_config.default.access_token
  cluster_ca_certificate = base64decode(module.cluster.cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = "https://${module.cluster.cluster_endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(module.cluster.cluster_ca_certificate)
  }
}

module "vpc" {
  source       = "./modules/vpc"
  vpc_name     = var.vpc_name
  subnet_cidr  = var.subnet_cidr
  region       = var.region
}

module "cluster" {
  source                        = "./modules/cluster"
  region                        = var.region
  project_id                    = var.project_id
  network                       = module.vpc.vpc_network_id
  subnetwork                    = module.vpc.subnetwork_id
  services_secondary_range_name = module.vpc.secondary_ip_range_services.range_name
  cluster_secondary_range_name  = module.vpc.secondary_ip_range_pods.range_name
}

module "app" {
  source                  = "./modules/app"
  cluster_endpoint        = module.cluster.cluster_endpoint
  cluster_ca_certificate  = module.cluster.cluster_ca_certificate
  token                   = data.google_client_config.default.access_token
  cluster_name            = module.cluster.name
  cluster_location        = module.cluster.location
}

module "monitoring" {
  source                  = "./modules/monitoring"
  cluster_endpoint        = module.cluster.cluster_endpoint
  cluster_ca_certificate  = module.cluster.cluster_ca_certificate
  token                   = data.google_client_config.default.access_token
}

module "permission" {
  source = "./modules/permission"
}
