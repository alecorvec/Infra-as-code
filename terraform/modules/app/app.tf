terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = ">= 2.24.0"
    }
  }
}

resource "kubernetes_deployment_v1" "default" {
  metadata {
    name = "example-infra-app-deployment"
  }
  spec {
    selector {
      match_labels = {
        app = "infra-app"
      }
    }
    template {
      metadata {
        labels = {
          app = "infra-app"
        }
      }
      spec {
        container {
          image = "us-docker.pkg.dev/google-samples/containers/gke/infra-app:2.0"
          name  = "infra-app-container"
          
          resources {
            limits = {
              cpu    = "200m"
              memory = "256Mi"
            }
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          port {
            container_port = 8080
            name          = "infra-app-svc"
          }

          security_context {
            allow_privilege_escalation = false
            privileged                = false
            read_only_root_filesystem = false
            capabilities {
              add  = []
              drop = ["NET_RAW"]
            }
          }

          startup_probe {
            http_get {
              path = "/"
              port = "infra-app-svc"
            }
            initial_delay_seconds = 10
            period_seconds       = 5
            failure_threshold    = 30
          }

          liveness_probe {
            http_get {
              path = "/"
              port = "infra-app-svc"
            }
            initial_delay_seconds = 60
            period_seconds       = 10
          }

          readiness_probe {
            http_get {
              path = "/"
              port = "infra-app-svc"
            }
            initial_delay_seconds = 30
            period_seconds       = 10
          }
        }
        security_context {
          run_as_non_root = true
          seccomp_profile {
            type = "RuntimeDefault"
          }
        }
        # Toleration is currently required to prevent perpetual diff:
        # https://github.com/hashicorp/terraform-provider-kubernetes/pull/2380
        toleration {
          effect   = "NoSchedule"
          key      = "kubernetes.io/arch"
          operator = "Equal"
          value    = "amd64"
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "default" {
  metadata {
    name = "infra-app-loadbalancer"
    annotations = {
      "networking.gke.io/load-balancer-type" = "Internal"
    }
  }
  spec {
    selector = {
      app = kubernetes_deployment_v1.default.spec[0].selector[0].match_labels.app
    }
    port {
      port        = 80
      target_port = kubernetes_deployment_v1.default.spec[0].template[0].spec[0].container[0].port[0].name
    }
    type = "LoadBalancer"
  }
}
