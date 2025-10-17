terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
      version = ">= 2.24.0"
    }
    helm = {
      source = "hashicorp/helm"
      version = ">= 2.12.0"
    }
  }
}

resource "null_resource" "cleanup_failed_release" {
  triggers = {
    cluster_endpoint       = var.cluster_endpoint
    token                 = var.token
    cluster_ca_certificate = var.cluster_ca_certificate
  }

  provisioner "local-exec" {
    command = <<-EOT
      echo "${base64decode(var.cluster_ca_certificate)}" > /tmp/ca.crt
      KUBECONFIG=/tmp/kubeconfig kubectl config set-cluster cleanup-cluster --server=https://${var.cluster_endpoint} --certificate-authority=/tmp/ca.crt
      KUBECONFIG=/tmp/kubeconfig kubectl config set-credentials cleanup-user --token=${var.token}
      KUBECONFIG=/tmp/kubeconfig kubectl config set-context cleanup-context --cluster=cleanup-cluster --user=cleanup-user
      KUBECONFIG=/tmp/kubeconfig kubectl config use-context cleanup-context
      KUBECONFIG=/tmp/kubeconfig kubectl delete secret -n monitoring -l owner=helm,name=prometheus --ignore-not-found
      KUBECONFIG=/tmp/kubeconfig kubectl delete configmap -n monitoring -l owner=helm,name=prometheus --ignore-not-found
      rm -f /tmp/ca.crt /tmp/kubeconfig
    EOT
  }
}

resource "helm_release" "prometheus" {
  depends_on = [null_resource.cleanup_failed_release]
  name             = "prometheus"
  repository       = "https://prometheus-community.github.io/helm-charts"
  chart            = "kube-prometheus-stack"
  version          = "45.13.0"
  namespace        = "monitoring"
  create_namespace = true

  values = [<<-EOF
    global:
      rbac:
        create: true
        pspEnabled: false

    commonLabels:
      cluster: autopilot

    prometheusOperator:
      tls:
        enabled: true
      admissionWebhooks:
        enabled: false
      kubeletService:
        enabled: false
      securityContext:
        runAsNonRoot: true
        runAsUser: 65534

    alertmanager:
      enabled: true
      securityContext:
        runAsNonRoot: true
        runAsUser: 65534
      alertmanagerSpec:
        securityContext:
          runAsNonRoot: true
          runAsUser: 65534

    grafana:
      enabled: true
      service:
        type: LoadBalancer
      securityContext:
        runAsNonRoot: true
        runAsUser: 65534

    kubeStateMetrics:
      enabled: true
      securityContext:
        runAsNonRoot: true
        runAsUser: 65534

    prometheus:
      enabled: true
      prometheusSpec:
        securityContext:
          runAsNonRoot: true
          runAsUser: 65534
        resources:
          requests:
            cpu: 200m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
        storageSpec:
          volumeClaimTemplate:
            spec:
              accessModes:
                - ReadWriteOnce
              resources:
                requests:
                  storage: 10Gi

    prometheus-node-exporter:
      enabled: false

    kubelet:
      enabled: false

    kubeScheduler:
      enabled: false

    kubeControllerManager:
      enabled: false

    kubeEtcd:
      enabled: false

    kubeProxy:
      enabled: false
    EOF
  ]
}
