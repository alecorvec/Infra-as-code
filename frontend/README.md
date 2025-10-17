# Frontend - Task Manager API

Application React moderne et scalable pour la gestion de tâches, construite avec une architecture optimisée pour les environnements load-balanced en production.

## 🚀 Tech Stack

- **React 18** - UI library avec Hooks
- **TypeScript** - Type safety strict
- **Vite 4** - Fast build tool (compatible Node.js 18)
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client avec interceptors avancés
- **Heroicons** - Icônes SVG de qualité

## ✨ Features Clés

### Architecture Scalable
- ✅ **Correlation IDs** - Tracing des requêtes à travers les load balancers
- ✅ **Retry Logic** - 3 tentatives automatiques avec backoff exponentiel
- ✅ **Request Timestamps** - Timestamp ISO 8601 sur toutes les mutations
- ✅ **Auth Ready** - Support Bearer Token automatique
- ✅ **Error Handling** - Gestion unifiée des erreurs avec correlation_id
- ✅ **Batch Operations** - Opérations multiples optimisées
- ✅ **Timeout Management** - 30s pour gérer le load balancing

### API Layer
- 🔧 **Service Abstraction** - Couche d'abstraction complète
- 🔧 **Custom Hooks** - Hooks React pour chaque opération
- 🔧 **Type Safety** - Types TypeScript pour toutes les entités
- 🔧 **Loading States** - Gestion automatique des états de chargement
- 🔧 **Error States** - Gestion automatique des erreurs

### UI/UX
- 🎨 **Responsive Design** - Mobile-first avec Tailwind
- 🎨 **Dashboard Stats** - Vue d'ensemble des tâches
- 🎨 **Task Cards** - Cartes interactives avec actions
- 🎨 **Form Validation** - Validation côté client
- 🎨 **Loading Indicators** - Feedback visuel
- 🎨 **Error Display** - Affichage élégant des erreurs

## 📋 Prerequisites

- Node.js 18.13.0+ (Pour Vite 5+: Node.js 20.19+ ou 22.12+)
- npm ou yarn
- Backend API Task Manager en cours d'exécution

## 🛠️ Installation

1. **Cloner et naviguer vers le projet:**
```bash
cd frontend
```

2. **Installer les dépendances:**
```bash
npm install
```

3. **Configurer les variables d'environnement:**
```bash
cp .env.example .env
```

4. **Éditer le fichier `.env` avec votre configuration:**
```env
VITE_API_URL=http://localhost:8000/api
```

## 🏃 Démarrage

### Mode développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`

### Build production
```bash
npm run build
```

### Preview production
```bash
npm run preview
```

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.config.ts          # Configuration Axios avec interceptors
│   │   └── services/
│   │       └── task.service.ts      # Service API abstraction
│   │
│   ├── components/
│   │   ├── TaskCard.tsx             # Carte de tâche
│   │   ├── TaskForm.tsx             # Formulaire création/édition
│   │   ├── TaskList.tsx             # Liste des tâches
│   │   └── ErrorDisplay.tsx         # Affichage d'erreurs
│   │
│   ├── hooks/
│   │   └── useTasks.ts              # Hooks personnalisés pour API
│   │
│   ├── types/
│   │   └── task.types.ts            # Types TypeScript
│   │
│   └── app/
│       └── App.tsx                  # Composant principal
│
├── public/                          # Assets statiques
├── .env                             # Variables d'environnement
├── .env.example                     # Template des variables
├── ARCHITECTURE.md                  # Documentation d'architecture
├── tailwind.config.js               # Configuration Tailwind
├── postcss.config.js                # Configuration PostCSS
├── tsconfig.json                    # Configuration TypeScript
└── vite.config.ts                   # Configuration Vite
```

## � Utilisation

### Créer une tâche
1. Cliquer sur "Nouvelle tâche"
2. Remplir le formulaire (titre, description, date d'échéance)
3. Cliquer sur "Créer"

### Modifier une tâche
1. Cliquer sur l'icône crayon sur une tâche
2. Modifier les champs
3. Cliquer sur "Mettre à jour"

### Marquer comme complétée
Cliquer sur le cercle à gauche du titre de la tâche

### Supprimer une tâche
Cliquer sur l'icône poubelle (confirmation demandée)

## 🔧 API Integration

### Configuration Axios

Le fichier `src/api/axios.config.ts` configure automatiquement:

```typescript
// Ajout automatique du token
headers.Authorization = `Bearer ${localStorage.getItem('auth_token')}`

// Ajout automatique du correlation_id
headers.correlation_id = `${Date.now()}-${randomString()}`

// Ajout automatique du request_timestamp
body.request_timestamp = new Date().toISOString()
```

### Utiliser le Service

```typescript
import { taskService } from '@/api/services/task.service'

// Récupérer toutes les tâches
const tasks = await taskService.getTasks()

// Récupérer une tâche
const task = await taskService.getTaskById('123')

// Créer une tâche
const newTask = await taskService.createTask({
  title: "Ma tâche",
  content: "Description",
  due_date: "2025-12-31"
})

// Mettre à jour une tâche
const updated = await taskService.updateTask('123', {
  title: "Nouveau titre",
  done: true
})

// Supprimer une tâche
await taskService.deleteTask('123')
```

### Utiliser les Hooks

```typescript
import { useTasks, useCreateTask } from '@/hooks/useTasks'

function MyComponent() {
  const { tasks, loading, error, refetch } = useTasks()
  const { createTask } = useCreateTask()
  
  const handleCreate = async () => {
    await createTask({
      title: "Nouvelle tâche",
      content: "Description",
      due_date: "2025-12-31"
    })
    refetch() // Recharger la liste
  }
  
  return (...)
}
```

## � Customisation

### Tailwind CSS

Modifier `tailwind.config.js` pour personnaliser le thème:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      },
    },
  },
}
```

### Axios Configuration

Modifier `src/api/axios.config.ts`:

```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000, // Augmenter le timeout
})
```

### Retry Logic

Modifier les paramètres de retry dans `axios.config.ts`:

```typescript
const defaultRetryConfig = {
  retries: 5,        // Plus de tentatives
  retryDelay: 2000,  // Délai plus long
}
```

## 🔐 Authentification

Le système supporte l'authentification Bearer Token:

```typescript
// Stocker le token après login
localStorage.setItem('auth_token', 'your-jwt-token')

// Le token est automatiquement ajouté à toutes les requêtes
// Les erreurs 401 redirigent automatiquement vers /login
```

## 📊 Monitoring & Debugging

### Logs Console

Chaque requête affiche:
```
[correlation_id] Request: POST /tasks
[correlation_id] Response: 201 (245ms)
```

En cas d'erreur:
```
[correlation_id] Error: 500
[correlation_id] Retrying request (1/3) after 1000ms
```

### Correlation IDs

Utilisez les correlation_ids pour tracer les requêtes:
- Affichés dans les logs console
- Inclus dans les messages d'erreur
- Utilisables pour le debugging backend

## 📝 Scripts Disponibles

```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build pour production
npm run preview      # Preview du build production
npm run lint         # Linter le code
```

## � Troubleshooting

### Port 5173 déjà utilisé
```bash
# Utiliser un port différent
npm run dev -- --port 3000
```

### Erreurs de connexion API
1. Vérifier que le backend est démarré
2. Vérifier l'URL dans `.env`
3. Vérifier les CORS sur le backend

### Erreurs de build
```bash
# Nettoyer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Production

### Build

```bash
npm run build
```

Les fichiers seront dans `dist/`

### Variables d'environnement

Créer un fichier `.env.production`:
```env
VITE_API_URL=https://api.votredomaine.com/api
```

### Déploiement

Compatible avec:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Nginx
- Apache

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentation détaillée de l'architecture
- [API Documentation](../backend/README.md) - Documentation de l'API backend

## 🤝 Contributing

1. Créer une branche feature
2. Faire vos modifications
3. Tester localement
4. Créer une Pull Request

## 📄 License

MIT

## 👥 Support

Pour toute question, ouvrir une issue sur le repository.

---

**Note sur Node.js:** Ce projet utilise Vite 4.x pour la compatibilité avec Node.js 18. Pour utiliser Vite 5+, mettez à jour Node.js vers la version 20.19+ ou 22.12+.
