# Badminton Rivalry Tracker


Application web pour enregistrer, visualiser et comparer les résultats d'entraînements en triangle entre **Matthias**, **Paul** et **Steven**.


## Fonctionnalités
- Saisie rapide de la séance du jour (3 matchs: A vs B, B vs C, A vs C)
- Historique des séances
- Classement avec stats cumulées (J, V, D, points pour/contre, diff)
- Persistance **localStorage** (immédiat) ou **Supabase** (partagé)


## Lancer en local
```bash
npm i
npm run dev
```


## Construire & déployer
```bash
npm run build
# Netlify: dossier dist/
```


## Activer Supabase (optionnel)
1. Crée un projet sur https://supabase.com
2. Dans SQL Editor, crée la table :
```sql
CREATE TABLE IF NOT EXISTS sessions (
id uuid PRIMARY KEY,
date timestamptz NOT NULL,
matches jsonb NOT NULL,
notes text
);
```
3. Copie l'URL et la ANON KEY du projet dans `.env.local` :
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
4. Sur Netlify, ajoute ces variables dans **Environment variables**.


## Idées d'amélioration
- Règles de validation (ex: set à 21, écart de 2, tie-break, etc.)
- Elo par joueur, graphiques d'évolution
- Filtres par période, tags d'entraînement
- Export CSV
- Auth (Google) pour plusieurs appareils