-- ============================================================================
-- Cartographie MDF — Migration 006 : reporting hebdomadaire des référents
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- Table alignée 1:1 sur le type TS WeeklyReport (shared/types/index.ts).
-- Les remontées sont créées par les référents depuis l'onglet Reporting et
-- traitées par le bureau (statuts NOUVEAU / EN_COURS / TRAITE, réponses,
-- historique d'actions). Convention : id générés côté client ('rep-*'),
-- dates ISO stockées en texte tel quel, tri technique sur created_at.
-- ============================================================================

create table if not exists weekly_reports (
  id text primary key,                    -- 'rep-<ts>'
  case_number text,                       -- '#125'
  referent_id text not null default '',
  referent_name text not null default '',
  email text not null default '',
  telephone text,
  zone text not null default '',
  zone_id text,
  type text default 'PERIODIQUE'
    check (type is null or type in ('PERIODIQUE', 'PONCTUEL')),
  sujet text,
  priority text
    check (priority is null or priority in ('NORMAL', 'IMPORTANT', 'URGENT')),
  semaine_lundi text not null default '', -- YYYY-MM-DD
  nouveaux_contactes text,
  situations_prioritaires text,
  activites_locales text,
  besoin_retour_bureau boolean not null default false,
  details_demande_retour text,
  urgence_level int not null default 1,
  status text not null default 'NOUVEAU'
    check (status in ('NOUVEAU', 'EN_COURS', 'TRAITE')),
  bureau_notes text,
  pieces_jointes jsonb not null default '[]',
  responsable_id text,
  responsable_name text,
  date_prise_en_charge text,
  date_reponse text,
  date_traitement text,
  reponses jsonb not null default '[]',       -- échanges Bureau/Référent
  action_history jsonb not null default '[]', -- traçabilité des actions
  created_at_iso text not null,               -- WeeklyReport.createdAt (ISO)
  updated_at_iso text,
  last_activity_at text,
  reviewed_by text,
  reviewed_at text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists weekly_reports_status_idx on weekly_reports (status);
create index if not exists weekly_reports_referent_idx on weekly_reports (referent_id);
create index if not exists weekly_reports_created_idx on weekly_reports (created_at desc);

-- Trigger updated_at (fonction set_updated_at créée par 001_init.sql)
drop trigger if exists weekly_reports_updated on weekly_reports;
create trigger weekly_reports_updated before update on weekly_reports
  for each row execute function set_updated_at();

-- RLS activé sans policy : deny-all pour anon/authenticated.
-- Seule l'API Express (service_role) accède à la table.
alter table weekly_reports enable row level security;

grant all privileges on table weekly_reports to service_role;
