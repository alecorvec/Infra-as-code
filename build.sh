#!/bin/bash

# Function to print messages with timestamps
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a resource exists in GCP
check_resource() {
    local resource_type=$1
    local resource_name=$2
    local extra_params=$3

    case $resource_type in
        "vpc")
            gcloud compute networks describe $resource_name --project=test-infra-dev &>/dev/null
            ;;
        "subnet")
            gcloud compute networks subnets describe $resource_name --region=europe-west2 --project=test-infra-dev &>/dev/null
            ;;
        "cluster")
            gcloud container clusters describe $resource_name --region=europe-west2 --project=test-infra-dev &>/dev/null
            ;;
        *)
            return 1
            ;;
    esac
    return $?
}

# Function to handle resource import
import_resource() {
    local resource_type=$1
    local terraform_resource=$2
    local gcp_resource=$3

    if terraform import $terraform_resource $gcp_resource 2>/dev/null; then
        log "Successfully imported $resource_type"
        return 0
    else
        log "Failed to import $resource_type - it may not exist yet"
        return 1
    fi
}

# Error handling
handle_error() {
    local exit_code=$?
    log "Error occurred in script at line $1"
    exit $exit_code
}

trap 'handle_error $LINENO' ERR

cd terraform || exit 1

# Ensure we're authenticated with GCloud
log "Authenticating with Google Cloud..."
if ! gcloud auth application-default login; then
    log "Failed to authenticate with Google Cloud"
    exit 1
fi

log "Initializing Terraform..."
if ! terraform init -backend-config=backends/dev.config; then
    log "Failed to initialize Terraform"
    exit 1
fi

# Create or update VPC
log "Creating/Updating VPC..."
if terraform plan -target=module.vpc -detailed-exitcode &>/dev/null; then
    log "No changes needed for VPC"
else
    log "Applying VPC changes..."
    if ! terraform apply -target=module.vpc -auto-approve; then
        log "Failed to apply VPC changes"
        exit 1
    fi
fi

# Wait a moment for VPC to be fully ready
sleep 10

# Create or update cluster
log "Creating/Updating GKE cluster..."
if terraform plan -target=module.cluster -detailed-exitcode &>/dev/null; then
    log "No changes needed for cluster"
else
    log "Applying cluster changes..."
    if ! terraform apply -target=module.cluster -auto-approve; then
        log "Failed to apply cluster changes"
        exit 1
    fi
fi

# Wait for cluster to be ready
sleep 30

# Get cluster credentials
log "Getting cluster credentials..."
if ! gcloud container clusters get-credentials infra-autopilot-cluster --region=europe-west2 --project=test-infra-dev; then
    log "Failed to get cluster credentials. Waiting 30 seconds and trying again..."
    sleep 30
    if ! gcloud container clusters get-credentials infra-autopilot-cluster --region=europe-west2 --project=test-infra-dev; then
        log "Failed to get cluster credentials after retry"
        exit 1
    fi
fi

log "Waiting for cluster to be fully ready..."
log "This may take up to 2 minutes..."
for i in {1..4}; do
    log "Waiting... ($i/4)"
    sleep 30
done

# Create or update monitoring resources
log "Creating/Updating monitoring resources..."
if terraform plan -target=module.monitoring -detailed-exitcode &>/dev/null; then
    log "No changes needed for monitoring"
else
    log "Applying monitoring changes..."
    if ! terraform apply -target=module.monitoring -auto-approve; then
        log "Failed to apply monitoring changes"
        log "Checking monitoring namespace..."
        kubectl get pods -n monitoring
        exit 1
    fi
fi

# Wait for monitoring to be ready
log "Waiting for monitoring to be ready..."
sleep 30

# Create or update app resources
log "Creating/Updating app resources..."
if terraform plan -target=module.app -detailed-exitcode &>/dev/null; then
    log "No changes needed for app resources"
else
    log "Applying app changes..."
    if ! terraform apply -target=module.app -auto-approve; then
        log "Failed to apply app changes"
        log "Checking pod status..."
        kubectl get pods
        log "Checking pod details..."
        kubectl describe pods -l app=infra-app
        log "Checking pod logs..."
        kubectl logs -l app=infra-app --tail=50
        exit 1
    fi
fi

# Wait for app deployments to complete
log "Waiting for app deployments to stabilize..."
sleep 30

# Final verification
log "Verifying deployments..."
kubectl get pods -A
log "Infrastructure deployment completed successfully!"

log "Infrastructure deployment completed successfully!"
