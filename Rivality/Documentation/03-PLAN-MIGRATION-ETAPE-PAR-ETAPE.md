# 🚀 Plan de Migration - Étape par Étape

## 📋 Vue d'Ensemble

Ce document détaille le processus exact de migration de votre code actuel vers la nouvelle architecture.

**Durée estimée** : 4-6 semaines (selon disponibilité)
**Risque** : Faible (migration progressive sans casser l'existant)

---

## 🎯 Phase 0 : Préparation (Jour 1-2)

### ✅ Checklist Préparation

- [ ] **Backup du code actuel**
  ```bash
  git branch backup-avant-refactoring
  git push origin backup-avant-refactoring
  ```

- [ ] **Créer une branche de développement**
  ```bash
  git checkout -b refactoring/nouvelle-architecture
  ```

- [ ] **Lire toute la documentation**
  - [ ] Architecture complète
  - [ ] Guide migration backend
  - [ ] Ce plan d'action

- [ ] **Installer Supabase local**
  - [ ] Docker installé et fonctionnel
  - [ ] Supabase démarré localement
  - [ ] Accès à Studio (http://localhost:3000)

- [ ] **Créer le schéma de base de données**
  - [ ] Exécuter `schema.sql` fourni
  - [ ] Vérifier les tables créées dans Studio
  - [ ] Tester une insertion manuelle

---

## 📦 Phase 1 : Setup Nouvelle Structure (Jour 3-5)

### Étape 1.1 : Créer la Structure de Dossiers

```bash
cd Rivality  # Votre projet actuel

# Créer la nouvelle structure
mkdir -p src/features/{auth,groups,sessions,stats,achievements,training,landing}
mkdir -p src/features/auth/{components,hooks,services,stores,types}
mkdir -p src/features/groups/{components,hooks,services,stores,types}
mkdir -p src/features/sessions/{components,hooks,services,stores,types}
mkdir -p src/components/{ui,layout,feedback}
mkdir -p src/infrastructure/{storage,api,cache}
mkdir -p src/lib/{validators,formatters,constants,errors}
mkdir -p src/pages
mkdir -p src/app
mkdir -p src/__tests__/{unit,integration}
```

### Étape 1.2 : Copier les Nouveaux Fichiers Types

```bash
# Copier le fichier types.ts depuis les exemples
cp /chemin/vers/code-examples/types/index.ts src/types/index.ts

# Vérifier qu'il compile
npm run build
```

**Fichiers à créer** :
- [x] `src/types/index.ts` (types complets)
- [ ] `src/infrastructure/storage/IStorageAdapter.ts`
- [ ] `src/infrastructure/storage/SupabaseAdapter.ts`
- [ ] `src/lib/errors/AppError.ts`
- [ ] `src/lib/constants/sports.ts`

### Étape 1.3 : Configuration Environnement

```bash
# Copier .env.example vers .env.local
cp .env.example .env.local
```

**Éditer `.env.local` :**
```env
# Supabase Local
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=VOTRE_ANON_KEY

# Features Flags
VITE_FEATURE_ACHIEVEMENTS=true
VITE_FEATURE_LEADERBOARD=true

# Mode
VITE_ENV=development
```

### ✅ Checklist Phase 1

- [ ] Structure de dossiers créée
- [ ] Fichier `types/index.ts` copié et compile
- [ ] Adapters de storage créés
- [ ] Variables d'environnement configurées
- [ ] Projet compile sans erreurs TypeScript

---

## 🔨 Phase 2 : Migration de l'Infrastructure (Jour 6-10)

### Étape 2.1 : Créer le Service de Configuration

**Fichier : `src/config/env.ts`**

```typescript
const env = {
  isDevelopment: import.meta.env.MODE === 'development',
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  
  features: {
    achievements: import.meta.env.VITE_FEATURE_ACHIEVEMENTS === 'true',
    leaderboard: import.meta.env.VITE_FEATURE_LEADERBOARD === 'true',
  },
};

export default env;
```

### Étape 2.2 : Initialiser le Storage Adapter

**Fichier : `src/infrastructure/storage/index.ts`**

```typescript
import { createStorageAdapter } from './SupabaseAdapter';
import env from '@/config/env';

export const storageAdapter = createStorageAdapter({
  provider: 'supabase',
  url: env.supabase.url,
  apiKey: env.supabase.anonKey,
});

// Export des méthodes pour faciliter l'usage
export const {
  getCurrentUser,
  signInWithOAuth,
  signOut,
  getGroups,
  createGroup,
  // ... autres méthodes
} = storageAdapter;
```

### Étape 2.3 : Migration Graduelle du Fichier `storage.ts`

**AVANT (ancien code)** :
```typescript
// lib/storage.ts
export const supabase = createClient(...)

export async function loadGroups() {
  const { data } = await supabase.from('groups').select('*');
  return data;
}
```

**APRÈS (nouvelle architecture)** :
```typescript
// infrastructure/storage/index.ts
import { storageAdapter } from './index';

export async function loadGroups(userId: string) {
  return storageAdapter.getGroups(userId);
}
```

**Migration Progressive** :
1. Garder `lib/storage.ts` intact
2. Créer `infrastructure/storage/index.ts` en parallèle
3. Utiliser les deux pendant la transition
4. Remplacer progressivement les imports
5. Supprimer `lib/storage.ts` à la fin

### ✅ Checklist Phase 2

- [ ] `config/env.ts` créé
- [ ] Storage adapter initialisé
- [ ] Tests unitaires des adapters passent
- [ ] Connexion à Supabase local fonctionne
- [ ] Lecture/écriture de données testée

---

## 🎨 Phase 3 : Extraction des Features (Jour 11-20)

### Étape 3.1 : Feature Auth (Jour 11-12)

**Fichiers à créer** :

1. **`features/auth/types/auth.types.ts`**
```typescript
export interface LoginCredentials {
  provider: 'google' | 'github';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
```

2. **`features/auth/hooks/useAuth.ts`**
```typescript
import { useEffect, useState } from 'react';
import { storageAdapter } from '@/infrastructure/storage';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storageAdapter.getCurrentUser().then(user => {
      setUser(user);
      setIsLoading(false);
    });
  }, []);

  const login = async (provider: 'google' | 'github') => {
    await storageAdapter.signInWithOAuth(provider);
  };

  const logout = async () => {
    await storageAdapter.signOut();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
```

3. **`features/auth/components/LoginForm.tsx`**
```typescript
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { login } = useAuth();

  return (
    <div className="space-y-4">
      <button
        onClick={() => login('google')}
        className="btn btn-primary"
      >
        Se connecter avec Google
      </button>
    </div>
  );
}
```

4. **Migrer le composant Login dans `App.tsx`**

**AVANT** :
```typescript
// Dans App.tsx (800 lignes)
const Login = () => {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  // ... reste du code
}
```

**APRÈS** :
```typescript
// features/auth/pages/LoginPage.tsx
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}

// App.tsx (beaucoup plus simple)
import { LoginPage } from '@/features/auth/pages/LoginPage';
```

### Étape 3.2 : Feature Groups (Jour 13-15)

**Fichiers à créer** :

1. **`features/groups/services/groupService.ts`**
```typescript
import { storageAdapter } from '@/infrastructure/storage';
import type { CreateGroupDTO } from '@/types';

export class GroupService {
  async getUserGroups(userId: string) {
    return storageAdapter.getGroups(userId);
  }

  async createGroup(data: CreateGroupDTO, userId: string) {
    // Validation
    if (!data.name || data.name.length < 2) {
      throw new Error('Le nom doit contenir au moins 2 caractères');
    }

    // Création
    return storageAdapter.createGroup(data, userId);
  }

  async deleteGroup(groupId: string) {
    // Business logic : vérifier que l'utilisateur est owner, etc.
    return storageAdapter.deleteGroup(groupId);
  }
}

export const groupService = new GroupService();
```

2. **`features/groups/hooks/useGroups.ts`**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '../services/groupService';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'react-hot-toast';

export function useGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['groups', user?.id],
    queryFn: () => groupService.getUserGroups(user!.id),
    enabled: !!user,
  });
}

export function useCreateGroup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupDTO) => 
      groupService.createGroup(data, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Groupe créé avec succès !');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
```

3. **`features/groups/components/GroupCard.tsx`**
```typescript
import { Group } from '@/types';
import { getSportIcon } from '@/lib/utils/sports';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-4 rounded-lg border hover:border-purple-300 transition"
    >
      <span className="text-3xl">{getSportIcon(group.sport_type)}</span>
      <div className="text-left">
        <h3 className="font-bold">{group.name}</h3>
        <p className="text-sm text-gray-500">{group.sport_type}</p>
      </div>
    </button>
  );
}
```

4. **Migrer Dashboard vers la nouvelle structure**

**AVANT (dans App.tsx)** :
```typescript
const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  
  useEffect(() => {
    loadGroups().then(setGroups);
  }, []);
  
  // 200 lignes de code...
}
```

**APRÈS** :
```typescript
// features/groups/pages/GroupsListPage.tsx
import { useGroups } from '../hooks/useGroups';
import { GroupCard } from '../components/GroupCard';

export function GroupsListPage() {
  const { data: groups, isLoading } = useGroups();

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid gap-4">
      {groups?.map(group => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  );
}
```

### Étape 3.3 : Feature Sessions (Jour 16-18)

Même processus que pour Groups :
1. Service layer
2. Custom hooks
3. Components
4. Pages

### Étape 3.4 : Feature Landing Page (Jour 19-20)

Extraire la landing page de `App.tsx` vers `features/landing/pages/LandingPage.tsx`

### ✅ Checklist Phase 3

- [ ] Feature Auth extraite et fonctionnelle
- [ ] Feature Groups extraite et fonctionnelle
- [ ] Feature Sessions extraite et fonctionnelle
- [ ] Landing Page extraite
- [ ] Tous les composants migrent vers la nouvelle structure
- [ ] App.tsx réduit à <100 lignes

---

## 🎭 Phase 4 : Nouveau App.tsx Minimaliste (Jour 21)

**Nouveau `App.tsx` (environ 50 lignes)** :

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import { LandingPage } from '@/features/landing/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';

// Hooks
import { useAuth } from '@/features/auth/hooks/useAuth';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

---

## 🧪 Phase 5 : Tests & Quality (Jour 22-25)

### Étape 5.1 : Setup Testing

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Configuration `vitest.config.ts`** :
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/__tests__/setup.ts',
  },
});
```

### Étape 5.2 : Tests Unitaires des Services

```typescript
// features/groups/__tests__/groupService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { groupService } from '../services/groupService';

describe('GroupService', () => {
  it('should create a group with valid data', async () => {
    const data = {
      name: 'Test Group',
      sport_type: 'badminton',
    };

    const group = await groupService.createGroup(data, 'user-123');
    
    expect(group).toBeDefined();
    expect(group.name).toBe('Test Group');
  });

  it('should throw error with invalid name', async () => {
    const data = {
      name: 'A', // Trop court
      sport_type: 'badminton',
    };

    await expect(
      groupService.createGroup(data, 'user-123')
    ).rejects.toThrow();
  });
});
```

### Étape 5.3 : Tests des Hooks

```typescript
// features/groups/__tests__/useGroups.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useGroups } from '../hooks/useGroups';

describe('useGroups', () => {
  it('should fetch groups', async () => {
    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

### ✅ Checklist Phase 5

- [ ] Vitest configuré
- [ ] Tests des services (>80% coverage)
- [ ] Tests des hooks (>70% coverage)
- [ ] Tests E2E des parcours critiques
- [ ] Tous les tests passent

---

## 🚀 Phase 6 : Déploiement (Jour 26-30)

### Étape 6.1 : Préparation Production

```bash
# Build de production
npm run build

# Test du build
npm run preview
```

### Étape 6.2 : Setup Serveur Production

Suivre le guide `02-MIGRATION-BACKEND.md` section "Déploiement Production"

### Étape 6.3 : Configuration CI/CD

**.github/workflows/deploy.yml** :
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### ✅ Checklist Phase 6

- [ ] Build de production fonctionne
- [ ] Supabase self-hosted déployé sur VPS
- [ ] Frontend déployé (Netlify/Vercel)
- [ ] Variables d'environnement configurées
- [ ] SSL/TLS activé
- [ ] Backups automatiques configurés
- [ ] Monitoring en place

---

## 📊 Métriques de Succès

### Avant Refactoring
- **App.tsx** : 800+ lignes
- **Couplage** : Fort (UI ↔️ Data)
- **Testabilité** : Faible
- **Time to add feature** : 2-3 jours

### Après Refactoring
- **App.tsx** : ~50 lignes
- **Couplage** : Faible (Clean Architecture)
- **Testabilité** : Élevée (>80% coverage)
- **Time to add feature** : 0.5-1 jour

---

## 🆘 Aide & Support

### En cas de blocage

1. **Relire la documentation** correspondante
2. **Vérifier les logs** (Console + Supabase Studio)
3. **Tester en isolation** (créer un mini-test)
4. **Demander de l'aide** (moi ! 😊)

### Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [React Query](https://tanstack.com/query/latest)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

## ✅ Checklist Globale du Projet

- [ ] Phase 0 : Préparation (Jour 1-2)
- [ ] Phase 1 : Setup Structure (Jour 3-5)
- [ ] Phase 2 : Migration Infrastructure (Jour 6-10)
- [ ] Phase 3 : Extraction Features (Jour 11-20)
- [ ] Phase 4 : Nouveau App.tsx (Jour 21)
- [ ] Phase 5 : Tests & Quality (Jour 22-25)
- [ ] Phase 6 : Déploiement (Jour 26-30)

**Prêt à commencer ? Let's go ! 🚀**
