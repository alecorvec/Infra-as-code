#!/bin/bash

# Script de build Docker
set -e

echo "🐳 Construction de l'image Docker..."

# Vérifier que Dockerfile existe
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile non trouvé"
    exit 1
fi

# Construire l'image Docker
echo "🔨 Construction de l'image..."
docker build -t backend-test:latest .

# Vérifier que l'image a été créée
if [ -z "$(docker images -q backend-test:latest)" ]; then
    echo "❌ L'image Docker n'a pas été créée"
    exit 1
fi

echo "✅ Image Docker construite avec succès!"
echo "📦 Image: backend-test:latest"
