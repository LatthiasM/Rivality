# 🏗️ Architecture Complète - Rivality / Le Vestiaire

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Problèmes Actuels](#problèmes-actuels)
3. [Nouvelle Architecture](#nouvelle-architecture)
4. [Stack Technique](#stack-technique)
5. [Structure des Dossiers](#structure-des-dossiers)
6. [Patterns & Principes](#patterns--principes)
7. [Roadmap de Migration](#roadmap-de-migration)

---

## 🎯 Vue d'Ensemble

**Rivality / Le Vestiaire** est une plateforme SaaS de gestion de clubs sportifs avec deux volets :

### 👥 Côté Adhérent
- Suivi personnel des statistiques et performances
- Système de gamification (badges, achievements)
- Historique d'entraînement et progression
- Participation aux activités du club

### 🏢 Côté Club/Staff
- Gestion administrative (licences, cotisations)
- Planification des entraînements et matchs
- Suivi des performances des adhérents
- Communication interne
- Statistiques et rapports

### 🎮 Vision Produit
- **Phase 1** : Outil de gestion pour clubs (MVP actuel)
- **Phase 2** : Tracker personnel multi-sports
- **Phase 3** : Réseau social sportif avec matching

---

## ⚠️ Problèmes Actuels

### 1. **Dépendance Critique à Supabase Cloud**
- ❌ Tables expirées → perte de données
- ❌ Pas de contrôle sur l'infrastructure
- ❌ Coûts potentiellement élevés à l'échelle
- ❌ Vendor lock-in

### 2. **Architecture Monolithique**
- ❌ `App.tsx` : 800+ lignes (Landing + Auth + Dashboard)
- ❌ Logique métier dans les composants UI
- ❌ Pas de séparation des responsabilités
- ❌ Difficile à tester et maintenir

### 3. **Gestion des Données**
- ❌ Pas d'abstraction de la couche données
- ❌ Appels directs à Supabase partout
- ❌ Difficile de changer de backend
- ❌ Pas de cache ou d'optimisations

### 4. **Type Safety**
- ❌ Types incomplets (`any` utilisé)
- ❌ Pas de validation de données
- ❌ Risques d'erreurs runtime

### 5. **Developer Experience**
- ❌ Pas de gestion d'erreurs centralisée
- ❌ Pas de tests
- ❌ Pas de documentation du code
- ❌ Environnements de dev/prod non séparés

---

## 🏛️ Nouvelle Architecture

### Principes Directeurs

**1. Clean Architecture (Hexagonal)**
```
┌─────────────────────────────────────────────┐
│           UI Layer (React)                  │
│  ┌──────────────────────────────────────┐   │
│  │   Components / Pages / Routes        │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│       Application Layer (Hooks/State)       │
│  ┌──────────────────────────────────────┐   │
│  │  Custom Hooks / State Management     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Domain Layer (Business Logic)       │
│  ┌──────────────────────────────────────┐   │
│  │  Services / Use Cases / Entities     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Infrastructure Layer (Data Access)     │
│  ┌──────────────────────────────────────┐   │
│  │   Repositories / API Clients         │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
         ┌──────────────────────┐
         │   Database / APIs    │
         └──────────────────────┘
```

**2. Feature-Based Organization**
- Regroupement par fonctionnalité, pas par type de fichier
- Chaque feature est autonome et réutilisable
- Facilite la scalabilité

**3. Dependency Injection**
- Abstraction de toutes les dépendances externes
- Facilite les tests et le changement de providers
- Configuration centralisée

---

## 🛠️ Stack Technique

### Frontend (Inchangé)
```json
{
  "framework": "React 19",
  "language": "TypeScript 5.8",
  "build": "Vite 7",
  "styling": "TailwindCSS 3.4",
  "routing": "React Router 7",
  "forms": "React Hook Form + Zod",
  "state": "Zustand (léger, performant)",
  "ui-feedback": "React Hot Toast"
}
```

### Backend (NOUVEAU - Options)

#### **Option 1 : Supabase Self-Hosted** ⭐ RECOMMANDÉ
```yaml
Avantages:
  - Garde la même API cliente
  - Migration 0 ligne de code côté front
  - PostgreSQL + Auth + Storage + Realtime
  - Interface Admin complète
  - Hébergement sur votre serveur

Inconvénients:
  - Nécessite Docker
  - Configuration initiale plus lourde
  
Stack:
  - PostgreSQL 15
  - PostgREST (API auto-générée)
  - GoTrue (Auth)
  - Storage API
```

#### **Option 2 : Backend Custom Node.js**
```yaml
Avantages:
  - Contrôle total
  - Optimisations sur mesure
  - Pas de dépendances tierces

Inconvénients:
  - Plus de code à maintenir
  - Features à réimplémenter (Auth, Storage)
  
Stack:
  - Express/Fastify
  - PostgreSQL + Prisma ORM
  - JWT Auth custom
  - AWS S3 / MinIO pour storage
```

#### **Option 3 : PocketBase** 🚀 ALTERNATIVE SIMPLE
```yaml
Avantages:
  - Backend en 1 fichier (Go)
  - Admin UI incluse
  - Auth + Storage + Realtime
  - Déploiement ultra-simple
  
Inconvénients:
  - API différente de Supabase
  - Écosystème plus petit
  
Stack:
  - PocketBase (Go)
  - SQLite ou PostgreSQL
```

### **Recommandation : Supabase Self-Hosted**

**Pourquoi ?**
1. ✅ Migration 0 effort côté code React
2. ✅ Garde tous les avantages de Supabase
3. ✅ Contrôle total sur vos données
4. ✅ Scalable (PostgreSQL éprouvé)
5. ✅ Communauté active

---

## 📁 Structure des Dossiers (Nouvelle)

```
rivality/
├── 📱 apps/                          # Applications (si mono-repo futur)
│   ├── web/                          # App web principale
│   └── mobile/                       # App mobile (futur)
│
├── 📦 packages/                      # Packages partagés
│   ├── ui/                           # Composants UI réutilisables
│   ├── types/                        # Types TypeScript partagés
│   └── utils/                        # Utilitaires
│
├── 🎨 src/
│   ├── 📄 app/                       # Configuration App
│   │   ├── App.tsx                   # App root (minimaliste)
│   │   ├── router.tsx                # Configuration routes
│   │   └── providers.tsx             # Context providers
│   │
│   ├── 🎯 features/                  # Features (Domain-Driven)
│   │   ├── auth/
│   │   │   ├── components/           # UI Components
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── AuthGuard.tsx
│   │   │   ├── hooks/                # Custom hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useLogin.ts
│   │   │   ├── services/             # Business logic
│   │   │   │   └── authService.ts
│   │   │   ├── stores/               # State management
│   │   │   │   └── authStore.ts
│   │   │   ├── types/                # Types spécifiques
│   │   │   │   └── auth.types.ts
│   │   │   └── index.ts              # Public API
│   │   │
│   │   ├── groups/                   # Gestion des groupes/clubs
│   │   │   ├── components/
│   │   │   │   ├── GroupCard.tsx
│   │   │   │   ├── GroupForm.tsx
│   │   │   │   └── GroupList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useGroups.ts
│   │   │   │   └── useGroupMutations.ts
│   │   │   ├── services/
│   │   │   │   └── groupService.ts
│   │   │   ├── stores/
│   │   │   │   └── groupStore.ts
│   │   │   └── types/
│   │   │       └── group.types.ts
│   │   │
│   │   ├── sessions/                 # Sessions/Matchs (Rivality)
│   │   │   ├── components/
│   │   │   │   ├── SessionForm.tsx
│   │   │   │   ├── SessionList.tsx
│   │   │   │   └── ScoreInput.tsx
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   │
│   │   ├── stats/                    # Statistiques
│   │   │   ├── components/
│   │   │   │   ├── StatsChart.tsx
│   │   │   │   ├── Leaderboard.tsx
│   │   │   │   └── ProgressCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useStats.ts
│   │   │   ├── services/
│   │   │   │   ├── statsService.ts
│   │   │   │   └── statsCalculator.ts
│   │   │   └── types/
│   │   │
│   │   ├── achievements/             # Badges & Gamification
│   │   │   ├── components/
│   │   │   │   ├── BadgeCard.tsx
│   │   │   │   └── AchievementList.tsx
│   │   │   ├── services/
│   │   │   │   ├── achievementEngine.ts
│   │   │   │   └── badgeCalculator.ts
│   │   │   └── config/
│   │   │       └── badges.config.ts  # Définition des badges
│   │   │
│   │   ├── training/                 # Planification entraînements
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   │
│   │   └── landing/                  # Landing page
│   │       ├── components/
│   │       │   ├── Hero.tsx
│   │       │   ├── Features.tsx
│   │       │   ├── Pricing.tsx
│   │       │   └── BadgesShowcase.tsx
│   │       └── pages/
│   │           └── LandingPage.tsx
│   │
│   ├── 📑 pages/                     # Pages (assembly des features)
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── GroupDetailPage.tsx
│   │   └── ProfilePage.tsx
│   │
│   ├── 🧩 components/                # Composants UI génériques
│   │   ├── ui/                       # Primitives (Button, Input, Card...)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── PageLayout.tsx
│   │   └── feedback/                 # Loading, Empty states...
│   │       ├── LoadingSpinner.tsx
│   │       ├── ErrorBoundary.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── 🔌 infrastructure/            # Couche infrastructure
│   │   ├── api/                      # Clients API
│   │   │   ├── client.ts             # HTTP client configuré
│   │   │   └── endpoints.ts          # Endpoints API
│   │   │
│   │   ├── database/                 # Accès BDD
│   │   │   ├── repositories/         # Pattern Repository
│   │   │   │   ├── BaseRepository.ts
│   │   │   │   ├── GroupRepository.ts
│   │   │   │   ├── SessionRepository.ts
│   │   │   │   └── UserRepository.ts
│   │   │   ├── adapters/             # Adapters (Supabase, etc.)
│   │   │   │   ├── IStorageAdapter.ts     # Interface
│   │   │   │   ├── SupabaseAdapter.ts
│   │   │   │   ├── LocalStorageAdapter.ts
│   │   │   │   └── PostgresAdapter.ts
│   │   │   └── migrations/           # Migrations SQL
│   │   │
│   │   ├── storage/                  # File storage
│   │   │   └── fileStorage.ts
│   │   │
│   │   └── cache/                    # Stratégie de cache
│   │       └── cacheManager.ts
│   │
│   ├── 🎨 styles/                    # Styles globaux
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── 🛠️ lib/                       # Utilitaires & helpers
│   │   ├── validators/               # Validation schemas (Zod)
│   │   │   ├── group.schema.ts
│   │   │   ├── session.schema.ts
│   │   │   └── user.schema.ts
│   │   ├── formatters/               # Formatage de données
│   │   │   ├── date.ts
│   │   │   └── number.ts
│   │   ├── constants/                # Constantes
│   │   │   ├── sports.ts
│   │   │   └── routes.ts
│   │   └── errors/                   # Gestion erreurs
│   │       ├── AppError.ts
│   │       └── errorHandler.ts
│   │
│   ├── 🧪 __tests__/                 # Tests
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── 📝 types/                     # Types globaux
│   │   ├── entities/                 # Entités métier
│   │   │   ├── User.ts
│   │   │   ├── Group.ts
│   │   │   ├── Session.ts
│   │   │   └── Achievement.ts
│   │   ├── dtos/                     # Data Transfer Objects
│   │   └── global.d.ts
│   │
│   └── 🔧 config/                    # Configuration
│       ├── env.ts                    # Variables d'environnement
│       ├── app.config.ts             # Config app
│       └── sports.config.ts          # Config sports
│
├── 🐳 docker/                        # Docker configs
│   ├── docker-compose.yml            # Supabase local
│   ├── docker-compose.prod.yml
│   └── Dockerfile
│
├── 📜 scripts/                       # Scripts utilitaires
│   ├── db/
│   │   ├── seed.ts                   # Données de test
│   │   └── migrate.ts
│   └── deploy/
│
├── 📖 docs/                          # Documentation
│   ├── architecture/
│   ├── api/
│   └── contributing.md
│
├── 🌍 public/                        # Assets statiques
│
└── 📋 Configuration files
    ├── .env.example
    ├── .env.local
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

---

## 🎨 Patterns & Principes

### 1. **Repository Pattern**

Abstraction de l'accès aux données :

```typescript
// Interface (contrat)
interface IGroupRepository {
  findAll(userId: string): Promise<Group[]>;
  findById(id: string): Promise<Group | null>;
  create(data: CreateGroupDTO): Promise<Group>;
  update(id: string, data: UpdateGroupDTO): Promise<Group>;
  delete(id: string): Promise<void>;
}

// Implémentation Supabase
class SupabaseGroupRepository implements IGroupRepository {
  // ... implementation
}

// Implémentation Postgres direct
class PostgresGroupRepository implements IGroupRepository {
  // ... implementation
}
```

**Avantages :**
- ✅ Change de BDD sans toucher la logique métier
- ✅ Facilite les tests (mock du repository)
- ✅ Code découplé et maintenable

### 2. **Service Layer**

Logique métier isolée :

```typescript
class GroupService {
  constructor(
    private groupRepo: IGroupRepository,
    private userRepo: IUserRepository
  ) {}

  async createGroup(userId: string, data: CreateGroupDTO): Promise<Group> {
    // Validation
    const validated = groupSchema.parse(data);
    
    // Business logic
    const user = await this.userRepo.findById(userId);
    if (!user.canCreateGroup()) {
      throw new AppError('Max groups reached');
    }
    
    // Create
    const group = await this.groupRepo.create(validated);
    
    // Side effects
    await this.notifyMembers(group);
    
    return group;
  }
}
```

### 3. **Custom Hooks (UI Logic)**

```typescript
function useGroups() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupService.getUserGroups()
  });

  return { groups: data, isLoading, error };
}

function useCreateGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateGroupDTO) => 
      groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      toast.success('Groupe créé !');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
}
```

### 4. **Error Handling**

Gestion centralisée :

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

// Usage
throw new AppError('Groupe non trouvé', 'GROUP_NOT_FOUND', 404);

// Catching
try {
  await groupService.createGroup(data);
} catch (error) {
  if (error instanceof AppError) {
    handleAppError(error);
  } else {
    handleUnknownError(error);
  }
}
```

### 5. **Configuration par Environnement**

```typescript
// config/env.ts
const env = {
  isDevelopment: import.meta.env.MODE === 'development',
  api: {
    url: import.meta.env.VITE_API_URL,
    timeout: 10000
  },
  database: {
    provider: import.meta.env.VITE_DB_PROVIDER, // 'supabase' | 'postgres'
    url: import.meta.env.VITE_DATABASE_URL
  },
  features: {
    enableAchievements: import.meta.env.VITE_FEATURE_ACHIEVEMENTS === 'true'
  }
};
```

---

## 🗺️ Roadmap de Migration

### Phase 1 : Fondations (Semaine 1)
- [ ] Setup Backend Local (Supabase self-hosted)
- [ ] Création nouvelle structure de dossiers
- [ ] Migration des types TypeScript
- [ ] Setup des repositories

### Phase 2 : Refactoring Core (Semaine 2-3)
- [ ] Extraction de la logique métier en services
- [ ] Création des custom hooks
- [ ] Migration des composants UI
- [ ] Setup state management (Zustand)

### Phase 3 : Features (Semaine 4-5)
- [ ] Migration feature Groups
- [ ] Migration feature Sessions
- [ ] Migration feature Stats
- [ ] Système d'achievements

### Phase 4 : Polish (Semaine 6)
- [ ] Tests unitaires
- [ ] Documentation
- [ ] Optimisations performance
- [ ] Déploiement

---

## 📊 Métriques de Succès

### Avant Refactoring
- 📏 Lignes par fichier : Moyenne 400+ lignes
- 🔄 Couplage : Fort (BDD → UI directement)
- 🧪 Testabilité : Faible (logique dans les composants)
- 🔧 Maintenabilité : Difficile

### Après Refactoring
- 📏 Lignes par fichier : <200 lignes (SRP)
- 🔄 Couplage : Faible (layers bien séparées)
- 🧪 Testabilité : Élevée (mocks faciles)
- 🔧 Maintenabilité : Excellente
- ⚡ Performance : Optimisée (cache, lazy loading)
- 🚀 Scalabilité : Prête pour croissance

---

## 🎯 Prochaines Étapes

1. **Validation de cette architecture** avec vous
2. **Setup de l'environnement Backend Local**
3. **Création des fichiers de base** (types, repositories, services)
4. **Migration progressive** feature par feature

---

**Questions ? Clarifications ?**

Ce document sera mis à jour au fur et à mesure de l'avancement du projet.
