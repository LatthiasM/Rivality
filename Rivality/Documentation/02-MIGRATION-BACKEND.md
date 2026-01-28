# 🐳 Guide de Migration Backend - Supabase Self-Hosted

## 📋 Table des Matières

1. [Pourquoi Supabase Self-Hosted](#pourquoi-supabase-self-hosted)
2. [Prérequis](#prérequis)
3. [Installation & Configuration](#installation--configuration)
4. [Migration des Données](#migration-des-données)
5. [Configuration de l'Application](#configuration-de-lapplication)
6. [Déploiement Production](#déploiement-production)

---

## 🎯 Pourquoi Supabase Self-Hosted ?

### Comparaison des Options

| Critère | Supabase Cloud | Supabase Self-Hosted | Backend Custom |
|---------|---------------|---------------------|----------------|
| **Migration Code** | ✅ Aucune | ✅ Aucune | ❌ Récriture complète |
| **Contrôle Données** | ❌ Limité | ✅ Total | ✅ Total |
| **Coût Long Terme** | ❌ Élevé | ✅ Serveur fixe | ✅ Serveur fixe |
| **Maintenance** | ✅ Aucune | ⚠️ Moyenne | ❌ Élevée |
| **Features Built-in** | ✅ Toutes | ✅ Toutes | ❌ À développer |
| **Time to Market** | ✅ Immédiat | ✅ 2-3 jours | ❌ 2-3 mois |

### ✅ Notre Choix : Supabase Self-Hosted

**Avantages :**
- Migration en 0 ligne de code frontend
- Garde toutes les features (Auth, Storage, Realtime)
- Hébergement sur votre serveur (contrôle total)
- Coûts prévisibles
- Évolutif (PostgreSQL)

---

## 🛠️ Prérequis

### Matériel
- **Serveur dédié ou VPS** :
  - Minimum : 2 CPU, 4GB RAM, 20GB SSD
  - Recommandé : 4 CPU, 8GB RAM, 50GB SSD
  - OS : Ubuntu 22.04 LTS

### Logiciels
```bash
# Docker & Docker Compose
docker --version  # >= 24.0
docker compose version  # >= 2.20

# Git
git --version  # >= 2.30

# (Optionnel) Make
make --version
```

### Installation Docker (si nécessaire)
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Vérification
docker run hello-world
```

---

## 🚀 Installation & Configuration

### Étape 1 : Cloner Supabase

```bash
# Créer un dossier pour votre infrastructure
mkdir -p ~/rivality-infra
cd ~/rivality-infra

# Cloner le repo officiel
git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

### Étape 2 : Configuration de Base

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Générer des secrets sécurisés
cat > generate-secrets.sh << 'EOF'
#!/bin/bash
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "ANON_KEY=$(openssl rand -base64 32)"
echo "SERVICE_ROLE_KEY=$(openssl rand -base64 32)"
echo "DASHBOARD_PASSWORD=$(openssl rand -base64 16)"
EOF

chmod +x generate-secrets.sh
./generate-secrets.sh

# Copier les secrets générés dans .env
```

### Étape 3 : Éditer le fichier .env

```bash
nano .env
```

**Configuration Minimale :**

```env
############
# Secrets
############
JWT_SECRET=VOTRE_JWT_SECRET_GENERE
POSTGRES_PASSWORD=VOTRE_POSTGRES_PASSWORD_GENERE
ANON_KEY=VOTRE_ANON_KEY_GENEREE
SERVICE_ROLE_KEY=VOTRE_SERVICE_ROLE_KEY_GENEREE
DASHBOARD_PASSWORD=VOTRE_DASHBOARD_PASSWORD_GENERE

############
# Database
############
POSTGRES_HOST=db
POSTGRES_DB=postgres
POSTGRES_PORT=5432

############
# API
############
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

############
# API Proxy
############
API_EXTERNAL_URL=http://localhost:8000

############
# Auth
############
SITE_URL=http://localhost:5173
ADDITIONAL_REDIRECT_URLS=
JWT_EXPIRY=3600
DISABLE_SIGNUP=false
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=false
SMTP_ADMIN_EMAIL=admin@rivality.local
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

############
# Email Auth
############
ENABLE_EMAIL_SIGNUP=true
ENABLE_EMAIL_AUTOCONFIRM=true  # true en dev, false en prod

############
# OAuth Providers (Google)
############
ENABLE_OAUTH_GOOGLE=true
OAUTH_GOOGLE_CLIENT_ID=VOTRE_GOOGLE_CLIENT_ID
OAUTH_GOOGLE_SECRET=VOTRE_GOOGLE_SECRET

############
# Dashboard
############
DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=VOTRE_DASHBOARD_PASSWORD_GENERE

############
# Studio
############
STUDIO_PORT=3000
STUDIO_DEFAULT_ORGANIZATION=Rivality
STUDIO_DEFAULT_PROJECT=Rivality Production

############
# Storage
############
STORAGE_BACKEND=file
FILE_SIZE_LIMIT=52428800  # 50MB
```

### Étape 4 : Démarrage

```bash
# Démarrer tous les services
docker compose up -d

# Vérifier que tout tourne
docker compose ps

# Expected output:
# NAME                COMMAND             SERVICE    STATUS    PORTS
# supabase-db         "docker-entrypoint" postgres   Up        5432/tcp
# supabase-kong       "/docker-entrypoin" kong       Up        0.0.0.0:8000->8000/tcp
# supabase-studio     "docker-entrypoin"  studio     Up        0.0.0.0:3000->3000/tcp
# supabase-auth       "node dist/server"  auth       Up
# supabase-rest       "postgrest"         rest       Up
# supabase-realtime   "sh -c /app/bin/r"  realtime   Up
# supabase-storage    "docker-entrypoin"  storage    Up

# Voir les logs
docker compose logs -f
```

### Étape 5 : Accès aux Services

Une fois démarrés, vous avez accès à :

| Service | URL | Description |
|---------|-----|-------------|
| **Studio** | http://localhost:3000 | Interface d'administration |
| **API Gateway** | http://localhost:8000 | Point d'entrée API |
| **PostgreSQL** | localhost:5432 | Base de données directe |

**Connexion à Studio :**
- URL: http://localhost:3000
- Username: `supabase`
- Password: Celui défini dans `DASHBOARD_PASSWORD`

---

## 📊 Migration des Données

### Option 1 : Migration depuis Supabase Cloud (si données existantes)

```bash
# 1. Installer Supabase CLI
npm install -g supabase

# 2. Se connecter à l'ancien projet
supabase login
supabase link --project-ref VOTRE_PROJECT_REF

# 3. Dumper le schéma
supabase db dump --local > schema.sql

# 4. Dumper les données
supabase db dump --data-only --local > data.sql

# 5. Restaurer dans votre instance locale
docker exec -i supabase-db psql -U postgres -d postgres < schema.sql
docker exec -i supabase-db psql -U postgres -d postgres < data.sql
```

### Option 2 : Création Manuelle du Schéma

**Via Studio (Interface)** :
1. Ouvrir http://localhost:3000
2. Aller dans "Table Editor"
3. Créer les tables

**Via SQL (Recommandé)** :

Créer le fichier `schema.sql` :

```sql
-- =============================================
-- SCHEMA RIVALITY / LE VESTIAIRE
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLE: groups (Clubs/Teams)
-- =============================================
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  sport_type TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  description TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CONSTRAINT groups_name_check CHECK (char_length(name) >= 2)
);

-- Index
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_sport_type ON groups(sport_type);

-- RLS (Row Level Security)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group creators can update their groups"
  ON groups FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Group creators can delete their groups"
  ON groups FOR DELETE
  USING (created_by = auth.uid());

-- =============================================
-- TABLE: group_members (Adhérents)
-- =============================================
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Stats & Metadata
  stats JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(group_id, user_id)
);

-- Index
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);

-- RLS
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group members"
  ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
    )
  );

-- =============================================
-- TABLE: sessions (Matchs/Entraînements Rivality)
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  matches JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Metadata
  session_type TEXT DEFAULT 'training', -- 'training', 'match', 'tournament'
  location TEXT
);

-- Index
CREATE INDEX idx_sessions_group_id ON sessions(group_id);
CREATE INDEX idx_sessions_date ON sessions(date DESC);

-- RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view group sessions"
  ON sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = sessions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create sessions"
  ON sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = sessions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- =============================================
-- TABLE: solo_logs (Sports Solo: Muscu, Natation)
-- =============================================
CREATE TABLE IF NOT EXISTS solo_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(group_id, user_id, date)
);

-- Index
CREATE INDEX idx_solo_logs_group_id ON solo_logs(group_id);
CREATE INDEX idx_solo_logs_user_id ON solo_logs(user_id);
CREATE INDEX idx_solo_logs_date ON solo_logs(date DESC);

-- RLS
ALTER TABLE solo_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON solo_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own logs"
  ON solo_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own logs"
  ON solo_logs FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own logs"
  ON solo_logs FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- TABLE: achievements (Badges/Trophées)
-- =============================================
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL, -- 'pilier', 'goleador', etc.
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  progress JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(user_id, group_id, badge_id)
);

-- Index
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_group_id ON achievements(group_id);

-- RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their achievements"
  ON achievements FOR SELECT
  USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS (Statistiques pré-calculées)
-- =============================================

-- Vue: Statistiques globales par utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT
  gm.user_id,
  gm.group_id,
  g.sport_type,
  COUNT(DISTINCT s.id) as total_sessions,
  gm.stats as custom_stats
FROM group_members gm
LEFT JOIN groups g ON g.id = gm.group_id
LEFT JOIN sessions s ON s.group_id = gm.group_id
GROUP BY gm.user_id, gm.group_id, g.sport_type, gm.stats;

-- =============================================
-- SEED DATA (Développement)
-- =============================================

-- Insérer des sports types prédéfinis
CREATE TABLE IF NOT EXISTS sport_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL -- 'individual', 'team', 'combat', 'precision'
);

INSERT INTO sport_types (id, name, icon, category) VALUES
  ('badminton', 'Badminton', '🏸', 'team'),
  ('tennis', 'Tennis', '🎾', 'team'),
  ('football', 'Football', '⚽', 'team'),
  ('basketball', 'Basketball', '🏀', 'team'),
  ('musculation', 'Musculation', '🏋️', 'individual'),
  ('natation', 'Natation', '🏊', 'individual'),
  ('course', 'Course à pied', '🏃', 'individual'),
  ('boxe', 'Boxe', '🥊', 'combat'),
  ('judo', 'Judo', '🥋', 'combat')
ON CONFLICT (id) DO NOTHING;
```

**Exécuter le schéma :**

```bash
# Copier le fichier dans le container
docker cp schema.sql supabase-db:/tmp/schema.sql

# Exécuter
docker exec -it supabase-db psql -U postgres -d postgres -f /tmp/schema.sql

# Vérifier
docker exec -it supabase-db psql -U postgres -d postgres -c "\dt"
```

---

## ⚙️ Configuration de l'Application

### Mise à jour des Variables d'Environnement

Créer `.env.local` dans votre projet React :

```env
# Supabase Local
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=VOTRE_ANON_KEY_DU_FICHIER_ENV

# Alternative: utiliser l'IP de votre serveur
# VITE_SUPABASE_URL=http://192.168.1.100:8000
```

### Mise à jour du Code

**Aucun changement nécessaire dans votre code React !**

Le fichier `storage.ts` fonctionne déjà car il utilise `createClient` de Supabase.

**Seule modification** : les variables d'environnement

```typescript
// lib/storage.ts (INCHANGÉ)
export const supabase = USE_SUPABASE
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL!,     // Pointe vers localhost:8000
      import.meta.env.VITE_SUPABASE_ANON_KEY!  // Nouvelle clé générée
    )
  : null;
```

### Test de Connexion

```bash
# Démarrer votre app
npm run dev

# Tester la connexion
# 1. Ouvrir http://localhost:5173
# 2. Essayer de se connecter avec Google OAuth
# 3. Créer un groupe
# 4. Vérifier dans Studio que les données sont bien insérées
```

---

## 🌍 Déploiement Production

### Option 1 : VPS Simple (OVH, Hetzner, DigitalOcean)

**1. Préparer le serveur**

```bash
# Se connecter au VPS
ssh user@votre-serveur.com

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cloner Supabase
cd /opt
sudo git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
```

**2. Configuration Production**

```bash
# Copier et éditer .env
sudo cp .env.example .env
sudo nano .env
```

```env
# PRODUCTION SETTINGS
SITE_URL=https://app.rivality.fr
ADDITIONAL_REDIRECT_URLS=https://rivality.fr

# Désactiver signup public
DISABLE_SIGNUP=true

# Email confirmation
ENABLE_EMAIL_AUTOCONFIRM=false

# SMTP Production
SMTP_ADMIN_EMAIL=no-reply@rivality.fr
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=VOTRE_SENDGRID_API_KEY

# Sécurité
DASHBOARD_PASSWORD=MOT_DE_PASSE_ULTRA_SECURISE
```

**3. Reverse Proxy (Nginx)**

```bash
# Installer Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Configuration Nginx
sudo nano /etc/nginx/sites-available/rivality
```

```nginx
# API Backend
server {
    listen 80;
    server_name api.rivality.fr;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Studio Admin (optionnel, à sécuriser)
server {
    listen 80;
    server_name studio.rivality.fr;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
    
    # Authentification basique
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

```bash
# Activer la config
sudo ln -s /etc/nginx/sites-available/rivality /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL avec Let's Encrypt
sudo certbot --nginx -d api.rivality.fr -d studio.rivality.fr
```

**4. Démarrage automatique**

```bash
# Créer un service systemd
sudo nano /etc/systemd/system/supabase.service
```

```ini
[Unit]
Description=Supabase Stack
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/supabase/docker
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down

[Install]
WantedBy=multi-user.target
```

```bash
# Activer
sudo systemctl enable supabase
sudo systemctl start supabase
sudo systemctl status supabase
```

### Option 2 : Docker Swarm (Haute Disponibilité)

Pour un déploiement en cluster (si vous prévoyez beaucoup d'utilisateurs).

### Option 3 : Kubernetes (Enterprise)

Pour une infrastructure très scalable.

---

## 🔒 Sécurité

### Checklist Production

- [ ] **Firewall** : Autoriser uniquement ports 80, 443, SSH
- [ ] **SSL/TLS** : Certificats Let's Encrypt valides
- [ ] **Secrets** : Utiliser des secrets forts (>32 caractères)
- [ ] **Backups** : Automated PostgreSQL backups
- [ ] **RLS** : Row Level Security activée sur toutes les tables
- [ ] **Rate Limiting** : Configurer Kong rate limits
- [ ] **Monitoring** : Logs centralisés (ex: Grafana + Prometheus)
- [ ] **Updates** : Système de mise à jour régulier

### Backups Automatiques

```bash
# Script de backup quotidien
cat > /opt/backup-supabase.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups/supabase
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec supabase-db pg_dump -U postgres postgres | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup Storage (si file-based)
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C /opt/supabase/docker/volumes/storage .

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /opt/backup-supabase.sh

# Ajouter au cron (tous les jours à 2h du matin)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-supabase.sh") | crontab -
```

---

## 📊 Monitoring

### Logs

```bash
# Voir tous les logs
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f kong
docker compose logs -f auth
docker compose logs -f db

# Logs avec timestamp
docker compose logs -f --timestamps
```

### Métriques

Accès aux métriques via Studio :
- http://localhost:3000/project/_/reports

---

## ❓ Troubleshooting

### Problème : Les services ne démarrent pas

```bash
# Vérifier l'état
docker compose ps

# Recréer les containers
docker compose down
docker compose up -d --force-recreate

# Vérifier les logs
docker compose logs
```

### Problème : Connexion refusée depuis l'app React

```bash
# Vérifier que Kong écoute
curl http://localhost:8000/rest/v1/

# Si vous êtes sur un VPS, vérifier le firewall
sudo ufw status
sudo ufw allow 8000/tcp
```

### Problème : Google OAuth ne fonctionne pas

1. Vérifier que `SITE_URL` dans `.env` correspond à votre domaine
2. Dans Google Cloud Console, ajouter l'URL de callback :
   - `http://localhost:8000/auth/v1/callback` (dev)
   - `https://api.rivality.fr/auth/v1/callback` (prod)

---

## 🎯 Prochaines Étapes

1. ✅ Installation locale terminée
2. ⏭️ Migration des données (si existantes)
3. ⏭️ Configuration OAuth providers
4. ⏭️ Tests de l'application
5. ⏭️ Déploiement en production

---

## 📚 Ressources

- [Documentation Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Docker Compose Reference](https://supabase.com/docs/guides/self-hosting/docker)
- [Kong Configuration](https://docs.konghq.com/)
- [PostgreSQL Backups](https://www.postgresql.org/docs/current/backup.html)

---

**Questions ?** N'hésitez pas à demander de l'aide !
