# 📋 Frontend Code Quality & Standards

Ce document décrit les standards de qualité de code, les outils de linting et les conventions de style pour le frontend TypeScript/React.

## 🛠️ Outils Configurés

### ESLint
- **Configuration**: `.eslintrc.cjs`
- **Plugins**:
  - `@typescript-eslint` - Règles TypeScript
  - `react` - Règles React
  - `react-hooks` - Règles React Hooks
  - `jsx-a11y` - Accessibilité
  - `import` - Gestion des imports
  - `prettier` - Intégration Prettier

### Prettier
- **Configuration**: `.prettierrc`
- **Ignore**: `.prettierignore`
- **Standards**:
  - Single quotes
  - Semi-colons
  - 2 espaces d'indentation
  - 100 caractères par ligne

### TypeScript
- **Configuration**: `tsconfig.json`
- **Vérifications strictes activées**
- **Import types explicites**

### EditorConfig
- **Configuration**: `.editorconfig`
- **Cohérence entre éditeurs**

## 📝 Scripts Disponibles

### Scripts NPM

```bash
# Linting
npm run lint              # Vérifier les erreurs ESLint
npm run lint:fix          # Corriger automatiquement les erreurs ESLint

# Formatting
npm run format            # Formater le code avec Prettier
npm run format:check      # Vérifier le formatting

# Types
npm run type-check        # Vérifier les types TypeScript

# Vérifications complètes
npm run check-all         # Toutes les vérifications
npm run fix-all           # Toutes les corrections
```

### Script de Workflow

Le script `workflows/frontend-quality.sh` fournit une interface en ligne de commande :

```bash
# Depuis la racine du projet
./workflows/frontend-quality.sh [command]

# Commandes disponibles
./workflows/frontend-quality.sh check        # Vérification complète
./workflows/frontend-quality.sh fix          # Correction automatique
./workflows/frontend-quality.sh lint         # Linting seulement
./workflows/frontend-quality.sh format       # Formatting seulement
./workflows/frontend-quality.sh types        # Vérification types
./workflows/frontend-quality.sh stats        # Statistiques du code
./workflows/frontend-quality.sh report       # Génération de rapport
```

## 🔧 Configuration IDE

### VS Code

Configuration automatique dans `frontend/.vscode/settings.json` :
- Format automatique à la sauvegarde
- Corrections ESLint automatiques
- Support Tailwind CSS
- Préférences TypeScript

Extensions recommandées :
- ESLint
- Prettier
- TypeScript Importer
- Tailwind CSS IntelliSense

## 🚀 Intégration Git

### Pre-commit Hooks

Configuration avec Husky et lint-staged :
- Linting automatique des fichiers modifiés
- Formatting automatique
- Vérification avant commit

### GitHub Actions

Workflow `.github/workflows/frontend-quality.yml` :
- Vérification automatique sur les PRs
- Corrections automatiques (optionnel)
- Rapports de qualité
- Notifications sur macOS

## 📐 Standards de Code

### TypeScript

```typescript
// ✅ Bon
interface User {
  id: number;
  name: string;
  email?: string;
}

const fetchUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  
  return response.data;
};

// ❌ Mauvais
const fetchUser = async (id: any) => {
  const response = await api.get("/users/" + id);
  return response.data;
};
```

### React Components

```tsx
// ✅ Bon
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary',
  disabled = false 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {label}
    </button>
  );
};

// ❌ Mauvais
export const Button = (props: any) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};
```

### Imports

```typescript
// ✅ Bon - Imports groupés et triés
import React from 'react';
import type { FC } from 'react';

import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

import type { User } from './types';

// ❌ Mauvais - Imports désordonnés
import { Button } from '@/components/Button';
import React from 'react';
import { User } from './types';
import { useAuth } from '@/hooks/useAuth';
```

### Naming Conventions

```typescript
// ✅ Bon
const API_BASE_URL = 'https://api.example.com'; // Constantes
const userName = 'john_doe'; // camelCase variables
const UserProfile = () => {}; // PascalCase composants
const useUserData = () => {}; // camelCase hooks

interface UserData {} // PascalCase interfaces
type ApiResponse<T> = {} // PascalCase types

// ❌ Mauvais
const api_base_url = 'https://api.example.com';
const user_name = 'john_doe';
const userProfile = () => {};
const UseUserData = () => {};
```

## 🚨 Règles Importantes

### Erreurs Bloquantes

Ces erreurs empêchent le commit :
- Erreurs ESLint
- Erreurs TypeScript
- Formatting incorrect
- Imports non résolus
- Tests en échec

### Avertissements

Ces éléments génèrent des warnings :
- `console.log` en production
- Variables non utilisées
- Types `any` explicites
- Conditions inutiles

### Exceptions

Pour désactiver une règle ponctuellement :

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = response.data;

/* eslint-disable react-hooks/exhaustive-deps */
useEffect(() => {
  // logique spéciale
}, []);
/* eslint-enable react-hooks/exhaustive-deps */
```

## 📊 Métriques de Qualité

### Indicateurs Suivis

- **Couverture ESLint**: 100% des fichiers
- **Erreurs TypeScript**: 0 erreur
- **Formatting**: 100% conforme Prettier
- **Complexité cyclomatique**: < 10 par fonction
- **Taille des fichiers**: < 300 lignes recommandé

### Génération de Rapports

```bash
# Rapport complet
./workflows/frontend-quality.sh report

# Statistiques
./workflows/frontend-quality.sh stats
```

## 🔄 Workflow de Développement

### 1. Avant de Coder
```bash
# Installer/mettre à jour les dépendances
npm install

# Vérifier la configuration
./workflows/frontend-quality.sh check
```

### 2. Pendant le Développement
```bash
# Mode développement avec linting
npm run dev

# Vérifications rapides
./workflows/frontend-quality.sh lint
```

### 3. Avant le Commit
```bash
# Corrections automatiques
./workflows/frontend-quality.sh fix

# Vérification finale
./workflows/frontend-quality.sh check
```

### 4. Pull Request
- Les GitHub Actions vérifient automatiquement
- Les corrections peuvent être appliquées automatiquement
- Le build de validation est exécuté

## 🆘 Dépannage

### Erreurs Communes

#### ESLint ne trouve pas les types
```bash
# Vérifier la configuration TypeScript
npm run type-check

# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

#### Prettier ne formate pas
```bash
# Vérifier la configuration
npx prettier --check "src/**/*.{ts,tsx}"

# Forcer le formatting
npx prettier --write "src/**/*.{ts,tsx}"
```

#### Conflits de formatting ESLint/Prettier
```bash
# S'assurer que eslint-config-prettier est installé
npm install --save-dev eslint-config-prettier
```

### Performance

Pour améliorer les performances :
```bash
# Nettoyer les caches
./workflows/frontend-quality.sh clean

# Linting incrémental
npx eslint --cache src/
```

## 📚 Ressources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [TypeScript ESLint](https://typescript-eslint.io/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [React Hooks Rules](https://reactjs.org/docs/hooks-rules.html)
- [Accessibility Guidelines](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y)

## 🤝 Contribution

Pour modifier les standards :
1. Proposer les changements dans une PR
2. Discuter avec l'équipe
3. Mettre à jour la documentation
4. Tester sur le code existant

---

*Dernière mise à jour : $(date)*