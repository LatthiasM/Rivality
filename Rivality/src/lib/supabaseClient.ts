/** Exemple de schéma SQL Supabase à créer (SQL editor) :
CREATE TABLE IF NOT EXISTS sessions (
id uuid PRIMARY KEY,
date timestamptz NOT NULL,
matches jsonb NOT NULL,
notes text
);
*/
export {}; // Ce fichier sert juste de mémo de schéma.