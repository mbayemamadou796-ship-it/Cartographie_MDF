-- ============================================================================
-- Cartographie MDF — Migration 002 : enrichissement du journal d'audit
-- (spec Cartographie1.md — horodatage complet, zone concernée, champ modifié)
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
-- ============================================================================

alter table audit_logs add column if not exists date_fr text;        -- "JJ/MM/AAAA"
alter table audit_logs add column if not exists time_fr text;        -- "HH:MM:SS" (Europe/Paris)
alter table audit_logs add column if not exists zone_name text;      -- zone MDF concernée (si applicable)
alter table audit_logs add column if not exists champ_modifie text;  -- champ modifié (audit fin)

-- Backfill des anciennes entrées depuis timestamp_fr ("JJ/MM/AAAA HH:mm")
update audit_logs
set date_fr = split_part(timestamp_fr, ' ', 1),
    time_fr = nullif(split_part(timestamp_fr, ' ', 2), '') || ':00'
where date_fr is null and timestamp_fr like '__/__/____%';

-- Index pour le tri/filtrage par date
create index if not exists audit_logs_date_idx on audit_logs (date_fr);
