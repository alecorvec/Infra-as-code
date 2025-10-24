# Guide de Test du Backend

Ce document explique comment utiliser les workflows GitHub Actions et les scripts de test pour le backend.

## 🚀 Workflows GitHub Actions

### Workflow Principal (`backend-test.yml`)

Le workflow se déclenche automatiquement sur :
- Push vers les branches `main`, `dev`, `backend-workflow`
- Pull requests vers `main` ou `dev`
- Modifications dans le dossier `backend/`

### Étapes du Workflow

1. **Setup de l'environnement**
   - Installation de Node.js 22
   - Cache des dépendances npm
   - Setup de PostgreSQL pour les tests

2. **Tests de Base**
   - Installation des dépendances
   - Génération du client Prisma
   - Application des migrations
   - Linting du code
   - Compilation TypeScript

3. **Tests Fonctionnels**
   - Tests unitaires avec `test.sh`
   - Tests d'API avec `api-test.sh`

4. **Tests Docker**
   - Construction de l'image Docker
   - Tests de l'image avec `docker-test.sh`

## 📜 Scripts de Test

### Scripts Disponibles

```bash
# Tests unitaires
npm run test:unit

# Tests d'API
npm run test:api

# Tests Docker
npm run test:docker

# Tous les tests
npm run test:all

# Construction Docker
npm run docker:build
```

### Scripts Shell

#### `scripts/test.sh`
- Vérifie la connexion à la base de données
- Exécute les tests unitaires
- Vérifie la compilation
- Teste l'existence des fichiers compilés

#### `scripts/api-test.sh`
- Démarre le serveur en arrière-plan
- Teste les endpoints API
- Vérifie les codes de statut HTTP
- Nettoie les processus

#### `scripts/docker-build.sh`
- Construit l'image Docker
- Vérifie que l'image est créée

#### `scripts/docker-test.sh`
- Lance un conteneur de test
- Teste les endpoints dans le conteneur
- Nettoie les ressources

#### `scripts/setup-test.sh`
- Configure l'environnement de test
- Crée la base de données de test
- Applique les migrations

## 🧪 Tests Locaux

### Prérequis
- Node.js 22+
- npm
- Docker (pour les tests Docker)

### Configuration
```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement de test
./scripts/setup-test.sh

# Exécuter les tests
npm run test:all
```

### Variables d'Environnement

Pour les tests, les variables suivantes sont utilisées :
- `NODE_ENV=development` (pour contourner l'authentification)
- `DATABASE_URL` (configurée automatiquement)
- `PORT=3000`

## 🔍 Endpoints de Test

### Endpoint de Santé
- **URL**: `GET /health`
- **Réponse**: Informations sur l'état de l'application et de la base de données

### Endpoints API
- **URL**: `GET /tasks` (Liste des tâches)
- **URL**: `GET /api-docs` (Documentation Swagger)

## 🐳 Tests Docker

Les tests Docker vérifient que :
- L'image se construit correctement
- Le conteneur démarre sans erreur
- Les endpoints sont accessibles
- La base de données fonctionne

## 📊 Monitoring des Tests

### Logs GitHub Actions
Les logs des workflows sont disponibles dans l'onglet "Actions" de GitHub.

### Tests Locaux
```bash
# Tests avec logs détaillés
npm run test:all 2>&1 | tee test-results.log

# Tests Docker avec logs
npm run docker:test 2>&1 | tee docker-test-results.log
```

## 🚨 Dépannage

### Problèmes Courants

1. **Erreur de connexion à la base de données**
   - Vérifier que PostgreSQL est en cours d'exécution
   - Vérifier les variables d'environnement

2. **Tests Docker qui échouent**
   - Vérifier que Docker est en cours d'exécution
   - Nettoyer les conteneurs : `docker system prune`

3. **Erreurs de compilation**
   - Vérifier la syntaxe TypeScript
   - Exécuter `npm run lint` pour les erreurs de style

### Commandes de Nettoyage
```bash
# Nettoyer les conteneurs Docker
docker system prune -f

# Nettoyer les fichiers de test
rm -f test.db test.db-journal

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📈 Améliorations Futures

- [ ] Ajouter des tests d'intégration
- [ ] Implémenter des tests de performance
- [ ] Ajouter des tests de sécurité
- [ ] Intégrer des métriques de couverture de code
- [ ] Ajouter des tests de charge
