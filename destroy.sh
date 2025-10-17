#!/bin/bash

# Function to print messages with timestamps
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors
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

# Destroy in reverse order of creation to handle dependencies

# First, destroy the app deployment
log "Destroying app resources..."
if terraform state list | grep -q "module.app"; then
    log "Found app resources, destroying them..."
    if ! terraform destroy -target=module.app -auto-approve; then
        log "Failed to destroy app resources"
        exit 1
    fi
fi

# Then destroy the monitoring resources
log "Destroying monitoring resources..."
if terraform state list | grep -q "module.monitoring"; then
    log "Found monitoring resources, destroying them..."
    if ! terraform destroy -target=module.monitoring -auto-approve; then
        log "Failed to destroy monitoring resources"
        exit 1
    fi
fi

# Next, destroy the GKE cluster
log "Destroying GKE cluster..."
if terraform state list | grep -q "module.cluster"; then
    log "Found cluster resources, destroying them..."
    if ! terraform destroy -target=module.cluster -auto-approve; then
        log "Failed to destroy cluster resources"
        exit 1
    fi
fi

# Finally, destroy the VPC and related networking resources
log "Destroying VPC and networking resources..."
if terraform state list | grep -q "module.vpc"; then
    log "Found VPC resources, destroying them..."
    if ! terraform destroy -target=module.vpc -auto-approve; then
        log "Failed to destroy VPC resources"
        exit 1
    fi
fi

log "Verifying destruction..."
remaining_resources=$(terraform state list | grep -v "module.permission")
if [ -n "$remaining_resources" ]; then
    log "Warning: Some non-permission resources still exist in state:"
    echo "$remaining_resources"
    exit 1
else
    log "Successfully destroyed all resources except permissions!"
fi
