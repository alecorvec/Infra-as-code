# Guide de Test - Task Manager Frontend

## 🧪 Test de l'Application

### Option 1: Test avec Backend Real

1. **Démarrer le backend:**
```bash
cd ../backend
npm run dev
```

2. **Vérifier que l'API tourne:**
```bash
curl http://localhost:8000/api/tasks
```

3. **Démarrer le frontend:**
```bash
npm run dev
```

4. **Ouvrir le navigateur:**
```
http://localhost:5173
```

### Option 2: Test avec Mock API (JSON Server)

Si vous n'avez pas encore de backend:

1. **Installer JSON Server:**
```bash
npm install -g json-server
```

2. **Créer un fichier `db.json`:**
```json
{
  "tasks": [
    {
      "id": "1",
      "title": "Première tâche",
      "content": "Ceci est ma première tâche de test",
      "due_date": "2025-12-31T00:00:00Z",
      "done": false,
      "created_at": "2025-10-17T10:00:00Z",
      "updated_at": "2025-10-17T10:00:00Z"
    },
    {
      "id": "2",
      "title": "Tâche complétée",
      "content": "Cette tâche est déjà terminée",
      "due_date": "2025-10-20T00:00:00Z",
      "done": true,
      "created_at": "2025-10-15T09:00:00Z",
      "updated_at": "2025-10-16T14:30:00Z"
    },
    {
      "id": "3",
      "title": "Tâche en retard",
      "content": "Cette tâche est en retard",
      "due_date": "2025-10-10T00:00:00Z",
      "done": false,
      "created_at": "2025-10-01T08:00:00Z",
      "updated_at": "2025-10-01T08:00:00Z"
    }
  ]
}
```

3. **Lancer JSON Server:**
```bash
json-server --watch db.json --port 8000
```

4. **Modifier `.env`:**
```env
VITE_API_URL=http://localhost:8000
```

5. **Démarrer le frontend:**
```bash
npm run dev
```

## 🔍 Tests Fonctionnels

### 1. Test de la Liste des Tâches
- [ ] La liste des tâches s'affiche
- [ ] Les tâches actives sont séparées des complétées
- [ ] Le dashboard affiche les bonnes statistiques
- [ ] Les tâches en retard sont marquées en rouge

### 2. Test de Création
- [ ] Cliquer sur "Nouvelle tâche"
- [ ] Remplir le formulaire
- [ ] Valider
- [ ] La nouvelle tâche apparaît dans la liste

### 3. Test de Modification
- [ ] Cliquer sur l'icône crayon d'une tâche
- [ ] Modifier le titre
- [ ] Valider
- [ ] Les changements sont reflétés

### 4. Test de Toggle Status
- [ ] Cliquer sur le cercle à gauche d'une tâche active
- [ ] La tâche passe en "complétée"
- [ ] Elle apparaît dans la section "Complétées"
- [ ] Re-cliquer pour la remettre en active

### 5. Test de Suppression
- [ ] Cliquer sur l'icône poubelle
- [ ] Confirmer la suppression
- [ ] La tâche disparaît de la liste

### 6. Test de Gestion d'Erreurs
- [ ] Arrêter le backend
- [ ] Essayer de créer une tâche
- [ ] Un message d'erreur s'affiche avec correlation_id
- [ ] Vérifier les logs console pour les retries

### 7. Test de Loading States
- [ ] Observer les spinners pendant le chargement
- [ ] Vérifier que les boutons sont désactivés pendant les actions
- [ ] Vérifier le feedback visuel

## 🔬 Test des Features Avancées

### Test Retry Logic

1. **Configurer un délai réseau:**
```bash
# Dans le backend, ajouter un délai artificiel
setTimeout(() => res.send(data), 10000) // 10 secondes
```

2. **Observer dans la console:**
```
[correlation_id] Request: GET /tasks
[correlation_id] Retrying request (1/3) after 1000ms
[correlation_id] Retrying request (2/3) after 2000ms
[correlation_id] Response: 200 (12500ms)
```

### Test Correlation IDs

1. **Ouvrir DevTools > Console**
2. **Faire une requête**
3. **Vérifier le log:**
```
[1729160000000-abc123xyz] Request: POST /tasks
```
4. **Chercher le même ID dans les logs backend**

### Test Timestamps

1. **Ouvrir DevTools > Network**
2. **Créer une tâche**
3. **Inspecter la requête POST**
4. **Vérifier le body:**
```json
{
  "title": "Ma tâche",
  "content": "Description",
  "due_date": "2025-12-31",
  "request_timestamp": "2025-10-17T10:43:20.123Z"
}
```

### Test Auth Token

1. **Dans Console DevTools:**
```javascript
localStorage.setItem('auth_token', 'test-token-123')
```

2. **Faire une requête**

3. **Dans Network, vérifier les headers:**
```
Authorization: Bearer test-token-123
```

## 📊 Performance Testing

### Test Batch Operations

1. **Modifier le code pour créer 10 tâches:**
```typescript
const promises = Array.from({ length: 10 }, (_, i) => 
  taskService.createTask({
    title: `Tâche ${i}`,
    content: `Description ${i}`,
    due_date: "2025-12-31"
  })
)
await Promise.all(promises)
```

2. **Observer les 10 requêtes en parallèle dans Network**
3. **Vérifier que chaque requête a un correlation_id unique**

## 🐛 Debug Tips

### Activer les logs détaillés

Dans `axios.config.ts`, ajouter:
```typescript
console.log('Request config:', JSON.stringify(config, null, 2))
console.log('Response data:', JSON.stringify(response.data, null, 2))
```

### Simuler des erreurs

```typescript
// Dans le backend
app.get('/tasks', (req, res) => {
  res.status(500).json({ message: 'Server Error' })
})
```

### Monitorer les retries

Ouvrir la console et observer:
```
[correlation_id] Request: GET /tasks
[correlation_id] Error: 500
[correlation_id] Retrying request (1/3) after 1000ms
```

## ✅ Checklist Complète

### Frontend
- [ ] Application démarre sans erreur
- [ ] Toutes les tâches s'affichent
- [ ] Dashboard stats corrects
- [ ] CRUD operations fonctionnent
- [ ] Error handling fonctionne
- [ ] Loading states visibles
- [ ] UI responsive sur mobile

### API Integration
- [ ] Correlation IDs générés
- [ ] Request timestamps ajoutés
- [ ] Auth token envoyé (si configuré)
- [ ] Retry logic fonctionne
- [ ] Erreurs loggées avec correlation_id

### Performance
- [ ] Temps de chargement < 1s
- [ ] Actions instantanées
- [ ] Pas de freeze UI
- [ ] Batch operations optimisées

## 📸 Screenshots Attendus

1. **Dashboard vide:** Message "Aucune tâche"
2. **Dashboard avec tâches:** Stats + liste séparée
3. **Formulaire:** Champs validés
4. **Erreur:** Message rouge avec correlation_id
5. **Loading:** Spinners visibles
6. **Mobile:** Layout adaptatif

## 🎯 KPIs de Succès

- ✅ 100% des CRUD operations fonctionnent
- ✅ Retry sur erreurs 5xx
- ✅ Correlation ID sur chaque requête
- ✅ Temps de réponse < 500ms (local)
- ✅ Aucune erreur console en utilisation normale
- ✅ UI responsive sur tous les devices
