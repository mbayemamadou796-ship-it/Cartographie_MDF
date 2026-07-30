# Schéma de Base de Données (Supabase / PostgreSQL) — Cartographie MDF

> **Source de vérité SQL** : [`backend/database/migrations/001_init.sql`](../backend/database/migrations/001_init.sql) — script idempotent à exécuter dans Supabase → SQL Editor.
>
> **Convention** : les identifiants sont générés côté client (`mdf-*`, `zone-*`, `usr-*`, `log-*`) → colonnes `id TEXT PRIMARY KEY`. Les colonnes sont alignées 1:1 sur les types TypeScript canoniques de `shared/types/index.ts` (le frontend étant figé, c'est lui qui fait autorité). Les dates affichées par l'interface (fr-FR) sont stockées **telles quelles** en `text` (`timestamp_fr`, `date_fr`, `last_login`, `created_at_iso`) ; le tri technique s'appuie sur `created_at TIMESTAMPTZ`.

## 1. Table `members` (Annuaire & Cartographie)

| Colonne | Type | Contraintes |
|---|---|---|
| `id` | text | PK (ex : `mdf-001`, `mdf-new-<ts>`, `mdf-ref-<usrid>`) |
| `nom` | text | NOT NULL |
| `prenom`, `telephone` | text | défaut `''` |
| `email` | text | **nullable** — unicité partielle `lower(email)` quand renseigné |
| `zone`, `situation_professionnelle`, `domaine_etude`, `annee_arrivee_france`, `fonction`, `organisation`, `adresse`, `code_postal`, `ville`, `departement`, `region`, `pays` | text | optionnels |
| `latitude`, `longitude` | double precision | calculées par géocodage (ville + zone) |
| `photo` | text | URL ou data-URL base64 (≤ 5 Mo) |
| `champs_personnalises` | jsonb | défaut `[]` — `{id, label, value}[]` |
| `created_at`, `updated_at` | timestamptz | trigger `set_updated_at()` |

Index : `members_email_uq` (unique partiel), `members_region_idx`, `members_ville_idx`, `members_nom_idx`.

## 2. Table `custom_zones` (Zones régionales)

| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | ex : `zone-bretagne`, `zone-<ts>` |
| `name` | text NOT NULL | |
| `description`, `color` | text | `color` = nom Tailwind (`blue`, `emerald`, ...) |
| `member_ids` | text[] | contrat TS `CustomZone.memberIds` (dénormalisation assumée) |
| `referent_user_id`, `referent_name` | text | référent désigné |
| `created_at_iso` | text | `CustomZone.createdAt` (ISO fournie par le client) |

## 3. Table `app_users` (Comptes applicatifs — liés à Supabase Auth)

| Colonne | Type | Notes |
|---|---|---|
| `id` | text PK | ex : `usr-admin`, `usr-<ts>` |
| `auth_user_id` | uuid UNIQUE | FK → `auth.users(id)` ON DELETE SET NULL |
| `nom`, `prenom`, `name` | text | |
| `email`, `username` | text NOT NULL | index uniques sur `lower()` |
| `role` | text | CHECK `('user','referent','admin')` |
| `region` | text | zone principale d'un référent |
| `assigned_zone_ids` | text[] | zones attribuées au référent |
| `active` | boolean | défaut `true` |
| `last_login`, `created_at_str` | text | chaînes libres fr (« En ligne », « Hier »...) |

> ⚠️ **Aucune colonne mot de passe** : les mots de passe vivent exclusivement dans Supabase Auth (`auth.users`, hash bcrypt). Le champ `password` du type TS `AppUser` est *write-only* : accepté en entrée d'API, routé vers l'Auth Admin API, jamais stocké ni renvoyé.

## 4. Table `audit_logs` (Journal d'audit)

`id text PK` · `timestamp_fr text` (fr-FR conservé tel quel) · `category` CHECK (`auth|member|zone|user|data|system`) · `action` · `details` · `user_id` / `user_name` / `user_role` (forcés côté serveur depuis le token) · `target_id` / `target_name` · `ancienne_valeur` / `nouvelle_valeur` · `severity` CHECK (`info|warning|danger`) · `created_at timestamptz` (tri).

## 5. Table `import_logs` (Historique des imports Excel)

`id text PK` · `filename` · `date_fr text` · `imported_by` · `total_rows` / `added_count` / `updated_count` / `location_changes_count` int · `errors jsonb` · `created_at timestamptz`.

## 6. Table `app_settings` (Paramètres de l'association — ligne unique `id = 1`)

`app_name` · `association_name` · `tagline` · `default_country` · `map_default_zoom` · `logo_url` (data-URL possible) · `last_update_date` (text fr-FR).

## Sécurité d'accès

- **RLS activé sur les 6 tables, sans aucune policy** → deny-all pour les clés `anon` / `authenticated`.
- **Grants réservés à `service_role`** : seule l'API Express (backend) lit/écrit les tables. Le frontend ne touche jamais Supabase directement (directive `docs/claude.md`).
- Compte racine seedé (`npm run seed`) : `salyndiayembaye@gmail.com` / username `bilal` / rôle `admin` — seul habilité à créer les autres comptes.

## Écarts assumés vs l'ancienne spécification

- `email` membre **nullable** (les imports Excel sans email existent) au lieu de `UNIQUE NOT NULL`.
- Ids `text` client au lieu d'`UUID` serveur (les données par défaut du frontend figé référencent `mdf-001`..., `zone-bretagne`... en dur).
- La relation membre↔zone reste portée par `custom_zones.member_ids text[]` (contrat du type TS `CustomZone`), pas par une FK.
