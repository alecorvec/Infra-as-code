#!/bin/bash

# Script de test pour le backend
set -e

echo "🧪 Démarrage des tests du backend..."

# Définir les variables d'environnement pour les tests
export DATABASE_URL="file:./test.db"
export NODE_ENV="development"

# Vérifier que la base de données est accessible
echo "📊 Vérification de la connexion à la base de données..."
npx prisma db push --accept-data-loss

# Lancer les tests unitaires (si ils existent)
echo "🔬 Exécution des tests unitaires..."
if [ -d "tests" ] && [ "$(ls -A tests)" ]; then
    npm test
else
    echo "⚠️  Aucun test unitaire trouvé, création d'un test basique..."
    # Créer un test basique pour vérifier que l'application démarre
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    async function test() {
        try {
            await prisma.\$connect();
            console.log('✅ Connexion à la base de données réussie');
            await prisma.\$disconnect();
            process.exit(0);
        } catch (error) {
            console.error('❌ Erreur de connexion à la base de données:', error);
            process.exit(1);
        }
    }
    
    test();
    "
fi

# Vérifier que l'application peut être compilée
echo "🔨 Vérification de la compilation..."
npm run build

# Vérifier que les fichiers compilés existent
if [ ! -d "dist" ]; then
    echo "❌ Le dossier dist n'existe pas après la compilation"
    exit 1
fi

if [ ! -f "dist/server.js" ]; then
    echo "❌ Le fichier server.js n'existe pas dans dist/"
    exit 1
fi

echo "✅ Tous les tests sont passés avec succès!"
