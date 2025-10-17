# Tasks API Backend

API REST de gestion des tâches avec authentification JWT et base de données SQLite.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Docker (optionnel)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:gen

# Créer la base de données
npm run prisma:migrate
```

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="file:./dev.db"

# Serveur
PORT=3000
NODE_ENV=development

# JWT (optionnel en développement)
JWKS_URL=https://your-auth-provider.com/.well-known/jwks.json
JWT_AUD=your-audience
JWT_ISS=https://your-auth-provider.com
```

### Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🐳 Docker

### Build et exécution

```bash
# Build de l'image
docker build -t iac-c4-api:latest .

# Exécution du conteneur
docker run -d -p 3000:3000 \
  -e NODE_ENV=development \
  -e DATABASE_URL="file:./dev.db" \
  iac-c4-api:latest
```

## 📚 Documentation API

### Swagger UI
Une fois le serveur démarré, accédez à la documentation interactive :
- **URL :** http://localhost:3000/api-docs
- **Description :** Interface Swagger complète avec tous les endpoints

### Endpoints disponibles

#### Health Check
- `GET /health` - Vérifier l'état de l'API

#### Tâches
- `POST /tasks` - Créer une nouvelle tâche
- `GET /tasks` - Récupérer toutes les tâches
- `GET /tasks/:id` - Récupérer une tâche par ID
- `PUT /tasks/:id` - Mettre à jour une tâche
- `DELETE /tasks/:id` - Supprimer une tâche

### Authentification

L'API utilise l'authentification JWT Bearer Token. En mode développement, l'authentification est contournée si aucune configuration JWT n'est fournie.

**Headers requis :**
```
Authorization: Bearer <token>
correlation_id: <unique-id>
Content-Type: application/json
```

### Exemples de requêtes

#### Créer une tâche
```bash
curl -H "correlation_id: abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma tâche",
    "content": "Description de la tâche",
    "due_date": "2025-12-31",
    "request_timestamp": "2025-10-17T10:00:00Z"
  }' \
  http://localhost:3000/tasks
```

#### Récupérer toutes les tâches
```bash
curl -H "correlation_id: abc124" \
  http://localhost:3000/tasks
```

#### Mettre à jour une tâche
```bash
curl -X PUT -H "correlation_id: abc125" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Titre modifié",
    "done": true,
    "request_timestamp": "2025-10-17T11:00:00Z"
  }' \
  http://localhost:3000/tasks/{id}
```

## 🏗️ Architecture

### Structure du projet
```
src/
├── controllers/     # Contrôleurs des routes
├── middlewares/     # Middlewares (auth, error, correlation)
├── routes/          # Définition des routes
├── lib/            # Utilitaires (Prisma client)
└── app.ts          # Configuration Express
```

### Technologies utilisées
- **Express.js** - Framework web
- **TypeScript** - Langage de programmation
- **Prisma** - ORM pour la base de données
- **SQLite** - Base de données (développement)
- **JWT** - Authentification
- **Swagger** - Documentation API
- **Zod** - Validation des données
- **Helmet** - Sécurité HTTP
- **Morgan** - Logging des requêtes
- **Rate Limiting** - Limitation du taux de requêtes

### Middlewares
- **Authentication** - Vérification JWT (contournable en dev)
- **Correlation** - Traçabilité des requêtes
- **Error Handler** - Gestion centralisée des erreurs
- **Rate Limiting** - 200 requêtes par 30 secondes

## 🔧 Scripts disponibles

```bash
npm run dev          # Démarrage en mode développement
npm run build        # Compilation TypeScript
npm start           # Démarrage en mode production
npm run lint        # Vérification du code
npm run prisma:gen  # Génération du client Prisma
npm run prisma:migrate # Migration de la base de données
```

## 🧪 Tests

```bash
# Test de santé
curl http://localhost:3000/health

# Test complet
curl -H "correlation_id: test" http://localhost:3000/tasks
```

## 📝 Modèle de données

### Task
```typescript
{
  id: string (UUID)
  title: string
  content: string
  due_date: Date
  done: boolean (default: false)
  last_request_timestamp: Date
  created_at: Date
  updated_at: Date
}
```

## 🚨 Gestion des erreurs

L'API retourne des codes de statut HTTP appropriés :
- `200` - Succès
- `201` - Créé
- `400` - Requête invalide
- `401` - Non autorisé
- `404` - Non trouvé
- `409` - Conflit (timestamp obsolète)
- `429` - Trop de requêtes

## 🔒 Sécurité

- **Helmet** - Headers de sécurité HTTP
- **Rate Limiting** - Protection contre les attaques DDoS
- **JWT** - Authentification sécurisée
- **Validation** - Validation stricte des données d'entrée
- **CORS** - Configuration des origines autorisées

## 📊 Monitoring

- **Morgan** - Logs des requêtes HTTP
- **Correlation ID** - Traçabilité des requêtes
- **Health Check** - Monitoring de l'état de l'API

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
