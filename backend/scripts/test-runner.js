#!/usr/bin/env node

// Test runner simple pour le backend
import { PrismaClient } from '@prisma/client';

// Définir la variable d'environnement DATABASE_URL si elle n'est pas définie
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'file:./test.db';
}

const prisma = new PrismaClient();

async function runTests() {
    console.log('🧪 Démarrage des tests unitaires...');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Connexion à la base de données
    try {
        await prisma.$connect();
        console.log('✅ Test 1: Connexion à la base de données - PASSED');
        passed++;
    } catch (error) {
        console.log('❌ Test 1: Connexion à la base de données - FAILED');
        console.error('   Erreur:', error.message);
        failed++;
    }
    
    // Test 2: Vérification du schéma Prisma
    try {
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        if (result && result.length > 0) {
            console.log('✅ Test 2: Requête SQL basique - PASSED');
            passed++;
        } else {
            throw new Error('Résultat de requête invalide');
        }
    } catch (error) {
        console.log('❌ Test 2: Requête SQL basique - FAILED');
        console.error('   Erreur:', error.message);
        failed++;
    }
    
    // Test 3: Vérification des modèles Prisma
    try {
        // Vérifier que les modèles sont accessibles
        const models = Object.keys(prisma).filter(key => 
            !key.startsWith('$') && !key.startsWith('_') && typeof prisma[key] === 'object'
        );
        
        if (models.length > 0) {
            console.log(`✅ Test 3: Modèles Prisma détectés (${models.length}) - PASSED`);
            console.log(`   Modèles: ${models.join(', ')}`);
            passed++;
        } else {
            throw new Error('Aucun modèle Prisma détecté');
        }
    } catch (error) {
        console.log('❌ Test 3: Modèles Prisma - FAILED');
        console.error('   Erreur:', error.message);
        failed++;
    }
    
    // Nettoyage
    try {
        await prisma.$disconnect();
    } catch (error) {
        console.warn('⚠️  Erreur lors de la déconnexion:', error.message);
    }
    
    // Résumé
    console.log('\n📊 Résumé des tests:');
    console.log(`   ✅ Passés: ${passed}`);
    console.log(`   ❌ Échoués: ${failed}`);
    console.log(`   📈 Total: ${passed + failed}`);
    
    if (failed > 0) {
        console.log('\n❌ Certains tests ont échoué!');
        process.exit(1);
    } else {
        console.log('\n🎉 Tous les tests sont passés!');
        process.exit(0);
    }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erreur non gérée:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exception non capturée:', error);
    process.exit(1);
});

// Exécuter les tests
runTests().catch((error) => {
    console.error('❌ Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
});
