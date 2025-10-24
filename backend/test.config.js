// Configuration pour les tests
export const testConfig = {
    NODE_ENV: 'test',
    PORT: 3000,
    DATABASE_URL: process.env.DATABASE_URL || 'file:./test.db',
    PRISMA_GENERATE_DATAPROXY: false
};

// Appliquer la configuration de test
Object.keys(testConfig).forEach(key => {
    if (!process.env[key]) {
        process.env[key] = testConfig[key];
    }
});
