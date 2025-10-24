#!/bin/bash

# Script de test Docker
set -e

echo "🐳 Test de l'image Docker..."

# Vérifier que l'image existe
if [ -z "$(docker images -q backend-test:latest)" ]; then
    echo "❌ L'image backend-test:latest n'existe pas"
    exit 1
fi

# Démarrer le conteneur
echo "🚀 Démarrage du conteneur de test..."
docker run -d --name backend-test-container -p 3001:3000 \
    -e DATABASE_URL="file:./test.db" \
    -e NODE_ENV=development \
    backend-test:latest

# Attendre que le conteneur démarre
echo "⏳ Attente du démarrage du conteneur..."
sleep 10

# Vérifier que le conteneur fonctionne
if ! docker ps | grep -q backend-test-container; then
    echo "❌ Le conteneur n'est pas en cours d'exécution"
    docker logs backend-test-container
    docker rm -f backend-test-container 2>/dev/null || true
    exit 1
fi

# Tester l'endpoint de santé
echo "🔍 Test de l'endpoint de santé..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Endpoint de santé accessible"
else
    echo "❌ Endpoint de santé non accessible - Status: $response"
    docker logs backend-test-container
    docker rm -f backend-test-container 2>/dev/null || true
    exit 1
fi

# Tester l'endpoint des tâches
echo "🔍 Test de l'endpoint des tâches..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/tasks || echo "000")

if [ "$response" = "200" ]; then
    echo "✅ Endpoint des tâches accessible"
else
    echo "❌ Endpoint des tâches non accessible - Status: $response"
    docker logs backend-test-container
    docker rm -f backend-test-container 2>/dev/null || true
    exit 1
fi

# Nettoyer
echo "🧹 Nettoyage du conteneur de test..."
docker rm -f backend-test-container 2>/dev/null || true

echo "✅ Tests Docker terminés avec succès!"
