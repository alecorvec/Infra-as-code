# Architecture Frontend - Task Manager

## 📐 Architecture Overview

Ce frontend a été conçu avec une architecture scalable et maintenable pour gérer efficacement les requêtes API avec load balancing.

```
frontend/
├── src/
│   ├── api/
│   │   ├── axios.config.ts          # Configuration Axios avancée
│   │   └── services/
│   │       └── task.service.ts      # Couche d'abstraction API
│   ├── components/
│   │   ├── TaskCard.tsx             # Composant carte de tâche
│   │   ├── TaskForm.tsx             # Formulaire création/édition
│   │   ├── TaskList.tsx             # Liste des tâches
│   │   └── ErrorDisplay.tsx         # Affichage d'erreurs
│   ├── hooks/
│   │   └── useTasks.ts              # Hooks React personnalisés
│   ├── types/
│   │   └── task.types.ts            # Définitions TypeScript
│   └── app/
│       └── App.tsx                  # Composant principal
```

## 🔑 Features Principales

### 1. Configuration Axios Scalable

**Fichier:** `src/api/axios.config.ts`

#### Features:
- ✅ **Correlation IDs** automatiques pour le tracing
- ✅ **Request Timestamps** ajoutés automatiquement
- ✅ **Retry Logic** avec backoff exponentiel
- ✅ **Auth Token** automatique depuis localStorage
- ✅ **Logging détaillé** avec durée des requêtes
- ✅ **Error Handling** unifié

#### Configuration:
```typescript
const defaultRetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    // Retry sur erreurs réseau ou 5xx
    return !error.response || (error.response.status >= 500)
  }
}
```

### 2. Service Layer (Abstraction API)

**Fichier:** `src/api/services/task.service.ts`

#### Methods:
- `getTasks(params?)` - Liste des tâches avec pagination
- `getTaskById(id)` - Récupérer une tâche
- `createTask(data)` - Créer une tâche
- `updateTask(id, data)` - Mettre à jour une tâche
- `toggleTaskStatus(id, status)` - Toggle statut
- `deleteTask(id)` - Supprimer une tâche
- `batchDeleteTasks(ids)` - Suppression batch
- `batchUpdateStatus(ids, done)` - Update batch

#### Exemple d'utilisation:
```typescript
import { taskService } from '@/api/services/task.service'

const tasks = await taskService.getTasks({ page: 1, per_page: 20 })
const task = await taskService.createTask({
  title: "Ma tâche",
  content: "Description",
  due_date: "2025-12-31"
})
```

### 3. Hooks React Personnalisés

**Fichier:** `src/hooks/useTasks.ts`

#### Hooks disponibles:
- `useTasks(autoFetch?)` - Fetch et gestion des tâches
- `useTask(id)` - Fetch d'une tâche spécifique
- `useCreateTask()` - Création de tâche
- `useUpdateTask()` - Mise à jour de tâche
- `useDeleteTask()` - Suppression de tâche
- `useBatchTasks()` - Opérations batch

#### Exemple:
```typescript
const { tasks, loading, error, refetch } = useTasks()
const { createTask, loading: creating } = useCreateTask()

await createTask({ title, content, due_date })
refetch() // Recharger la liste
```

### 4. Composants UI

Tous les composants utilisent **Tailwind CSS** et sont fully responsive.

#### TaskCard
- Affichage d'une tâche
- Toggle done/undone
- Édition et suppression
- Indicateur de retard

#### TaskForm
- Création/édition de tâches
- Validation des champs
- États loading

#### TaskList
- Affichage liste complète
- Séparation actives/complétées
- État vide élégant

## 🚀 Features pour Load Balancing

### 1. Correlation IDs
Chaque requête reçoit un ID unique pour le tracing à travers les load balancers:
```
correlation_id: 1729160000000-abc123xyz
```

### 2. Request Timestamps
Toutes les requêtes incluent un timestamp ISO 8601:
```json
{
  "title": "Ma tâche",
  "request_timestamp": "2025-10-17T10:43:20.000Z"
}
```

### 3. Retry Logic Intelligent
- 3 tentatives automatiques
- Délai croissant (1s, 2s, 3s)
- Retry uniquement sur erreurs réseau ou 5xx
- Logging détaillé de chaque retry

### 4. Timeout Management
```typescript
timeout: 30000 // 30 secondes pour gérer le load balancing
```

### 5. Batch Operations
Pour réduire le nombre de requêtes:
```typescript
// Au lieu de 10 requêtes individuelles
await taskService.batchUpdateStatus(['id1', 'id2', ...], true)
```

## 🔐 Authentification

Le système est prêt pour l'authentification:

```typescript
// Stocker le token
localStorage.setItem('auth_token', 'your-token')

// Le token est automatiquement ajouté à toutes les requêtes
headers: {
  Authorization: `Bearer ${token}`
}
```

## 📊 Error Handling

### Format d'erreur standardisé:
```typescript
interface ApiError {
  message: string
  status: number
  correlation_id?: string
  errors?: Record<string, string[]>
}
```

### Gestion automatique:
- **401:** Redirection vers /login
- **5xx:** Retry automatique
- **Autres:** Affichage d'erreur avec correlation_id

## 🎯 Best Practices Implémentées

1. ✅ **Separation of Concerns** - Services, Hooks, Components
2. ✅ **Type Safety** - TypeScript strict
3. ✅ **Error Boundaries** - Gestion d'erreurs
4. ✅ **Loading States** - UX optimale
5. ✅ **Accessibility** - Labels, aria-labels
6. ✅ **Responsive Design** - Mobile-first
7. ✅ **Performance** - Batch operations, memoization
8. ✅ **Scalability** - Architecture modulaire

## 🔧 Configuration

### Variables d'environnement (.env):
```bash
VITE_API_URL=http://localhost:8000/api
```

### Customiser Axios:
Modifier `src/api/axios.config.ts`:
```typescript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // Modifier le timeout
  headers: {
    'Content-Type': 'application/json',
    // Ajouter headers custom
  },
})
```

### Customiser Retry Logic:
```typescript
const defaultRetryConfig = {
  retries: 5,        // Plus de retries
  retryDelay: 2000,  // Délai plus long
}
```

## 📝 Testing

Pour tester avec un mock server:

```bash
# Dans le backend, lancer le serveur
npm run dev

# Dans le frontend
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🎨 Customisation UI

Tous les styles utilisent Tailwind CSS. Pour customiser:

1. Modifier `tailwind.config.js`
2. Ajouter des classes custom dans les composants
3. Utiliser les utilitaires Tailwind

## 📈 Monitoring

Chaque requête log:
- Correlation ID
- URL et méthode
- Durée d'exécution
- Status de réponse
- Erreurs avec stack trace

Exemple de log:
```
[1729160000000-abc123xyz] Request: GET /tasks
[1729160000000-abc123xyz] Response: 200 (342ms)
```

## 🔄 Future Improvements

- [ ] WebSocket pour updates en temps réel
- [ ] Optimistic UI updates
- [ ] Service Worker pour offline support
- [ ] React Query pour cache management
- [ ] End-to-end tests avec Playwright
- [ ] Storybook pour documentation composants
