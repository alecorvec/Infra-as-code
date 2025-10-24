#!/bin/bash

# Script de configuration pour les tests
set -e

echo "🔧 Configuration de l'environnement de test..."

# Créer le dossier de tests s'il n'existe pas
mkdir -p tests

# Installer les dépendances de test si nécessaire
echo "📦 Vérification des dépendances..."

# Créer un fichier de base de données de test
echo "🗄️  Configuration de la base de données de test..."
export DATABASE_URL="file:./test.db"
export NODE_ENV="test"

# Générer le client Prisma
echo "🔨 Génération du client Prisma..."
npx prisma generate

# Appliquer les migrations de test
echo "📊 Application des migrations de test..."
npx prisma db push --accept-data-loss

echo "✅ Configuration de test terminée!"
echo "🚀 Vous pouvez maintenant exécuter les tests avec:"
echo "   npm run test:unit"
echo "   npm run test:api"
echo "   npm run test:all"
