-- ============================================================================
-- Cartographie MDF — Migration 008 : Archives des mandats & Documents utiles
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- Deux tables alignées sur les types TS Mandat / UsefulDocument :
-- - mandats : réalisations, documents joints et bilan portés en jsonb (le
--   frontend manipule le mandat comme un tout) ;
-- - useful_documents : bibliothèque « Documents utiles » (fichiers en
--   data-URL/texte, historique de versions en jsonb).
-- Pas de seed SQL : le contenu initial (plaquette, mandats réels) vit dans le
-- frontend et sera poussé automatiquement par la synchronisation du premier
-- administrateur connecté.
-- ============================================================================

create table if not exists mandats (
  id text primary key,                    -- 'mandat-2026-2028'
  intitule text not null,
  date_debut text not null default '',    -- YYYY-MM-DD
  date_fin text not null default '',
  description text not null default '',
  responsables jsonb not null default '[]',
  statut text not null default 'EN_PREPARATION'
    check (statut in ('EN_PREPARATION', 'EN_COURS', 'TERMINE', 'ARCHIVE')),
  realisations jsonb not null default '[]',
  documents jsonb not null default '[]',  -- pièces jointes (data-URL possibles)
  bilan jsonb,                            -- MandatBilan (null si non rédigé)
  created_at_iso text not null,
  updated_at_iso text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists useful_documents (
  id text primary key,                    -- 'doc-<ts>'
  name text not null,
  description text not null default '',
  category text not null default 'AUTRE'
    check (category in ('PRESENTATION', 'OFFICIELS', 'GUIDE_ADHERENT', 'INFOS_PRATIQUES', 'FORMULAIRES', 'AUTRE')),
  custom_category_name text,
  file_url text,                          -- URL ou data-URL base64
  file_name text not null default '',
  file_type text not null default '',
  file_size bigint,
  version text not null default '1.0',
  date_publication text not null default '',
  date_mise_a_jour text not null default '',
  statut text not null default 'BROUILLON'
    check (statut in ('PUBLIE', 'BROUILLON', 'ARCHIVE')),
  ordre_affichage int,
  author_name text,
  versions_historique jsonb not null default '[]',
  tags jsonb not null default '[]',
  content text,                           -- contenu rédigé (markdown)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists useful_documents_statut_idx on useful_documents (statut);
create index if not exists mandats_statut_idx on mandats (statut);

-- Triggers updated_at (fonction set_updated_at créée par 001_init.sql)
drop trigger if exists mandats_updated on mandats;
create trigger mandats_updated before update on mandats
  for each row execute function set_updated_at();
drop trigger if exists useful_documents_updated on useful_documents;
create trigger useful_documents_updated before update on useful_documents
  for each row execute function set_updated_at();

-- RLS activé sans policy : deny-all pour anon/authenticated.
-- Seule l'API Express (service_role) accède aux tables.
alter table mandats enable row level security;
alter table useful_documents enable row level security;

grant all privileges on table mandats to service_role;
grant all privileges on table useful_documents to service_role;
