#!/bin/bash

# Script de test des API endpoints
set -e

echo "🌐 Test des endpoints API..."

# Définir les variables d'environnement pour les tests
export DATABASE_URL="file:./test.db"
export NODE_ENV="development"

# Démarrer le serveur en arrière-plan
echo "🚀 Démarrage du serveur de test..."
npm run build
node dist/server.js &
SERVER_PID=$!

# Attendre que le serveur démarre
echo "⏳ Attente du démarrage du serveur..."
sleep 5

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo "🔍 Test: $description"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" -L -X $method "http://localhost:3000$endpoint" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ $description - Status: $response"
    else
        echo "❌ $description - Status attendu: $expected_status, reçu: $response"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
}

# Tests des endpoints
echo "📋 Exécution des tests d'endpoints..."

# Test de l'endpoint de santé (si il existe)
test_endpoint "GET" "/health" "200" "Endpoint de santé"

# Test de l'endpoint des tâches
test_endpoint "GET" "/tasks" "200" "Liste des tâches"

# Test de l'endpoint Swagger
test_endpoint "GET" "/api-docs" "200" "Documentation Swagger"

# Test d'un endpoint inexistant
test_endpoint "GET" "/nonexistent" "404" "Endpoint inexistant"

# Test avec méthode non autorisée (DELETE sans ID)
test_endpoint "DELETE" "/tasks" "404" "Méthode non autorisée"

echo "✅ Tous les tests d'API sont passés!"

# Arrêter le serveur
echo "🛑 Arrêt du serveur de test..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo "🎉 Tests d'API terminés avec succès!"
