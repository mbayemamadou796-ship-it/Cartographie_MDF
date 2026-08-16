-- ============================================================================
-- Cartographie MDF — Migration 005 : référents de zone désignés par MEMBRE
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- La zone devient l'élément central de l'affectation : ses référents sont
-- désignés parmi ses MEMBRES (plusieurs possibles) — colonne
-- referent_member_ids. Le compte utilisateur (rôle referent +
-- assigned_zone_ids) reste une notion distincte : c'est lui qui donne les
-- droits d'accès. Les anciennes colonnes referent_user_id / referent_name
-- (référent unique par compte) sont conservées pour compatibilité.
-- ============================================================================

alter table custom_zones
  add column if not exists referent_member_ids text[] not null default '{}';
