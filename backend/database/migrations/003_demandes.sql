-- ============================================================================
-- Cartographie MDF — Migration 003 : demandes d'adhésion / mise à jour
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- Table alignée 1:1 sur le type TS DemandeMember (shared/types/index.ts).
-- Les demandes sont créées par le formulaire public (endpoint non authentifié
-- POST /api/public/demandes) puis validées/refusées depuis l'espace bureau.
-- Convention : id générés côté client ('dem-<ts>-<rand>'), dates ISO stockées
-- en texte tel quel (created_at_iso...), tri technique sur created_at.
-- ============================================================================

create table if not exists demandes (
  id text primary key,                    -- 'dem-<ts>-<rand>'
  type text not null check (type in ('INSCRIPTION', 'MISE_A_JOUR')),
  status text not null default 'EN_ATTENTE'
    check (status in ('EN_ATTENTE', 'VALIDEE', 'REFUSEE')),
  created_at_iso text not null,           -- DemandeMember.createdAt (ISO)
  updated_at_iso text,                    -- DemandeMember.updatedAt (ISO)
  validated_at text,                      -- DemandeMember.validatedAt (ISO)
  validated_by text,
  rejection_reason text,
  target_member_id text,                  -- si type = MISE_A_JOUR
  nom text not null,
  prenom text not null default '',
  email text not null default '',
  telephone text not null default '',
  adresse text,
  code_postal text,
  ville text not null default '',
  departement text,
  region text,
  zone text,
  pays text,
  situation_professionnelle text,
  domaine_etude text,
  annee_arrivee_france text,
  organisation text,
  fonction text,
  photo text,                             -- URL ou data-URL base64 (<= 5 Mo)
  latitude double precision,
  longitude double precision,
  champs_personnalises jsonb not null default '[]',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists demandes_status_idx on demandes (status);
create index if not exists demandes_created_idx on demandes (created_at desc);

-- Trigger updated_at (fonction set_updated_at créée par 001_init.sql)
drop trigger if exists demandes_updated on demandes;
create trigger demandes_updated before update on demandes
  for each row execute function set_updated_at();

-- RLS activé sans policy : deny-all pour anon/authenticated.
-- Seule l'API Express (service_role) accède à la table — le formulaire public
-- passe par POST /api/public/demandes, jamais par Supabase directement.
alter table demandes enable row level security;

grant all privileges on table demandes to service_role;

