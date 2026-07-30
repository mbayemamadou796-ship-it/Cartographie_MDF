-- ============================================================================
-- Cartographie MDF — Migration initiale (001_init.sql)
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- Convention : les identifiants sont générés côté client ('mdf-*', 'zone-*',
-- 'usr-*', 'log-*') => colonnes id en TEXT. Les dates affichées par le
-- frontend sont des chaînes formatées fr-FR : elles sont stockées telles
-- quelles (colonnes *_fr / last_login / created_at_iso), jamais parsées.
-- Le tri technique s'appuie sur created_at (timestamptz).
-- ============================================================================

-- Trigger générique de mise à jour d'updated_at
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ----------------------------------------------------------------------------
-- 1. app_settings — paramètres de l'association (ligne unique id = 1)
-- ----------------------------------------------------------------------------
create table if not exists app_settings (
  id int primary key default 1 check (id = 1),
  app_name text not null default 'Cartographie MDF',
  association_name text not null default 'Mbok de France',
  tagline text default 'au service de la fraternité !',
  default_country text default 'France',
  map_default_zoom int default 6,
  logo_url text,                          -- URL ou data-URL base64 (<= 5 Mo)
  last_update_date text,                  -- chaîne fr-FR libre (recordDataUpdate)
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 2. members — alignée 1:1 sur le type TS Member (shared/types/index.ts)
-- ----------------------------------------------------------------------------
create table if not exists members (
  id text primary key,                    -- 'mdf-001', 'mdf-new-<ts>', 'mdf-ref-<usrid>'
  nom text not null,
  prenom text not null default '',
  telephone text default '',
  email text,                             -- nullable : des membres importés n'ont pas d'email
  zone text,
  situation_professionnelle text,
  domaine_etude text,
  annee_arrivee_france text,
  fonction text,
  organisation text,
  adresse text,
  code_postal text,
  ville text,
  departement text,
  region text,
  pays text,
  latitude double precision,
  longitude double precision,
  photo text,                             -- URL ou data-URL base64 (<= 5 Mo)
  champs_personnalises jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Unicité de l'email uniquement quand il est renseigné
create unique index if not exists members_email_uq
  on members (lower(email)) where email is not null and email <> '';
create index if not exists members_region_idx on members (region);
create index if not exists members_ville_idx on members (ville);
create index if not exists members_nom_idx on members (nom);

-- ----------------------------------------------------------------------------
-- 3. custom_zones — member_ids en text[] (contrat TS CustomZone.memberIds)
-- ----------------------------------------------------------------------------
create table if not exists custom_zones (
  id text primary key,                    -- 'zone-bretagne', 'zone-<ts>'
  name text not null,
  description text,
  color text,                             -- nom Tailwind : 'blue', 'emerald', ...
  member_ids text[] not null default '{}',
  referent_user_id text,
  referent_name text,
  created_at_iso text not null,           -- CustomZone.createdAt (ISO fourni par le client)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- 4. app_users — comptes applicatifs, liés à Supabase Auth (PAS de password ici)
-- ----------------------------------------------------------------------------
create table if not exists app_users (
  id text primary key,                    -- 'usr-admin', 'usr-<ts>'
  auth_user_id uuid unique references auth.users(id) on delete set null,
  nom text default '',
  prenom text default '',
  name text,
  email text not null,
  username text not null,
  role text not null default 'user' check (role in ('user','referent','admin')),
  region text,
  assigned_zone_ids text[] not null default '{}',
  active boolean not null default true,
  created_at_str text,                    -- AppUser.createdAt (chaîne libre)
  last_login text not null default 'Nouveau',  -- chaîne libre fr ("En ligne", "Hier", ...)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists app_users_username_uq on app_users (lower(username));
create unique index if not exists app_users_email_uq on app_users (lower(email));

-- ----------------------------------------------------------------------------
-- 5. audit_logs — journal d'audit (timestamp fr-FR conservé tel quel)
-- ----------------------------------------------------------------------------
create table if not exists audit_logs (
  id text primary key,                    -- 'log-<ts>-<rand>'
  timestamp_fr text not null,             -- "JJ/MM/AAAA HH:mm" — jamais converti
  category text not null check (category in ('auth','member','zone','user','data','system')),
  action text not null,
  details text not null default '',
  user_id text not null,
  user_name text not null,
  user_role text not null,
  target_id text,
  target_name text,
  ancienne_valeur text,
  nouvelle_valeur text,
  severity text default 'info' check (severity in ('info','warning','danger')),
  created_at timestamptz default now()
);
create index if not exists audit_logs_created_idx on audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- 6. import_logs — historique des imports Excel
-- ----------------------------------------------------------------------------
create table if not exists import_logs (
  id text primary key,
  filename text not null,
  date_fr text not null,                  -- chaîne fr-FR
  imported_by text not null,
  total_rows int not null default 0,
  added_count int not null default 0,
  updated_count int not null default 0,
  location_changes_count int not null default 0,
  errors jsonb not null default '[]',
  created_at timestamptz default now()
);
create index if not exists import_logs_created_idx on import_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- Triggers updated_at sur les tables mutables
-- ----------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['app_settings','members','custom_zones','app_users'] loop
    execute format('drop trigger if exists %I_updated on %I', t, t);
    execute format('create trigger %I_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- Row Level Security : activé partout, AUCUNE policy.
-- => deny-all pour les clés anon/authenticated (défense en profondeur).
-- Seule l'API Express (service_role) accède aux tables ; le frontend ne
-- touche jamais Supabase directement (directive docs/claude.md).
-- ----------------------------------------------------------------------------
alter table app_settings enable row level security;
alter table members enable row level security;
alter table custom_zones enable row level security;
alter table app_users enable row level security;
alter table audit_logs enable row level security;
alter table import_logs enable row level security;

-- ----------------------------------------------------------------------------
-- Privilèges : seul service_role (utilisé par l'API Express) accède aux tables.
-- anon / authenticated ne reçoivent AUCUN grant (défense en profondeur,
-- en plus du RLS sans policy).
-- ----------------------------------------------------------------------------
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- Ligne unique des paramètres
insert into app_settings (id) values (1) on conflict do nothing;
