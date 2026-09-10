-- ============================================================================
-- Cartographie MDF — Migration 007 : Rencontres annuelles & sondage public
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- Deux tables alignées sur les types TS Rencontre / RencontreResponse :
-- les rencontres sont gérées depuis le bureau (onglet Rencontres) ; les
-- réponses arrivent du sondage public web-rencontre (app séparée, port 3003)
-- via POST /api/public/rencontres/responses, jamais par Supabase directement.
-- Seed : les deux rencontres réelles (2026 Toulouse, 2025 Rennes) — AUCUNE
-- réponse de démonstration.
-- ============================================================================

create table if not exists rencontres (
  id text primary key,                    -- 'rencontre-2026'
  nom text not null,
  annee int not null,
  description text not null default '',
  message_accueil text,
  date_debut text not null default '',    -- YYYY-MM-DD
  date_fin text not null default '',
  date_affichage text,
  lieu text not null default '',
  adresse text not null default '',
  date_limite text not null default '',
  date_limite_affichage text,
  statut text not null default 'BROUILLON'
    check (statut in ('BROUILLON', 'SONDAGE_OUVERT', 'SONDAGE_FERME', 'PREPARATION', 'TERMINEE', 'ARCHIVEE')),
  is_default boolean not null default false,
  bureau_notes text,                      -- interne bureau : jamais exposé au public
  created_at_iso text not null,
  updated_at_iso text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists rencontre_responses (
  id text primary key,                    -- 'resp-<ts>-<rand>'
  rencontre_id text not null,
  member_id text,
  nom text not null default '',
  prenom text not null default '',
  email text not null default '',
  telephone text not null default '',
  zone text not null default '',
  referent_name text,
  ville text,
  participation text not null default 'INCERTAIN'
    check (participation in ('OUI', 'NON', 'INCERTAIN')),
  duree_presence text
    check (duree_presence is null or duree_presence in ('TROIS_JOURS', 'WEEK_END')),
  aide_organisation boolean not null default false,
  domaines_aide jsonb not null default '[]',
  autre_precision text,
  remarques text,
  date_reponse text not null default '',
  created_at_iso text not null,
  updated_at_iso text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists rencontre_responses_rencontre_idx on rencontre_responses (rencontre_id);
create index if not exists rencontre_responses_created_idx on rencontre_responses (created_at desc);

-- Triggers updated_at (fonction set_updated_at créée par 001_init.sql)
drop trigger if exists rencontres_updated on rencontres;
create trigger rencontres_updated before update on rencontres
  for each row execute function set_updated_at();
drop trigger if exists rencontre_responses_updated on rencontre_responses;
create trigger rencontre_responses_updated before update on rencontre_responses
  for each row execute function set_updated_at();

-- RLS activé sans policy : deny-all pour anon/authenticated.
alter table rencontres enable row level security;
alter table rencontre_responses enable row level security;

grant all privileges on table rencontres to service_role;
grant all privileges on table rencontre_responses to service_role;

-- ----------------------------------------------------------------------------
-- Seed : rencontres réelles de l'association (relançable sans doublon)
-- ----------------------------------------------------------------------------
insert into rencontres (id, nom, annee, description, message_accueil, date_debut, date_fin, date_affichage, lieu, adresse, date_limite, date_limite_affichage, statut, is_default, bureau_notes, created_at_iso, updated_at_iso)
values
  ('rencontre-2026', 'Rencontre MDF 2026', 2026,
   'Grande rencontre annuelle nationale des membres et sympathisants de l''association Mbok de France (MDF). Un moment privilégié de fraternité, d''échanges, d''ateliers et de partage.',
   'السلام عليكم ورحمة الله وبركاته' || E'\n\n' ||
   'Nous avons le plaisir de vous annoncer que la rencontre MDF 2026 se tiendra du 25 au 27 décembre à Toulouse.' || E'\n\n' ||
   'Afin de bien préparer l''événement, nous vous invitons à répondre à ce formulaire.' || E'\n\n' ||
   'Votre réponse nous permettra d''organiser au mieux la rencontre et d''anticiper les besoins logistiques.',
   '2026-12-25', '2026-12-27', 'Du 25 au 27 décembre 2026',
   'Toulouse', '424 Montgay, 31560 Nailloux, Toulouse',
   '2026-11-30', '30 novembre 2026', 'SONDAGE_OUVERT', true,
   'Objectif de 150 participants. Coordination logistique avec l''antenne Occitanie et les référents régionaux.',
   '2026-08-01T10:00:00Z', '2026-08-20T14:30:00Z'),
  ('rencontre-2025', 'Rencontre MDF 2025', 2025,
   'Rencontre annuelle MDF 2025 organisée à Rennes (Bretagne). Bilan moral, assemblée générale et ateliers de cohésion.',
   'Rencontre annuelle tenue avec succès à Rennes du 26 au 28 décembre 2025.',
   '2025-12-26', '2025-12-28', 'Du 26 au 28 décembre 2025',
   'Rennes', 'Espace Associatif & Culturel, 35000 Rennes',
   '2025-11-30', '30 novembre 2025', 'TERMINEE', false,
   null,
   '2025-08-01T10:00:00Z', '2025-12-29T18:00:00Z')
on conflict (id) do nothing;
