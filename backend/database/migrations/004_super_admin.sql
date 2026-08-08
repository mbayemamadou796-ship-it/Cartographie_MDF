-- ============================================================================
-- Cartographie MDF — Migration 004 : rôle super_admin
-- À exécuter dans Supabase > SQL Editor. Script idempotent (relançable).
--
-- Hiérarchie des rôles : user < referent < admin < super_admin.
-- Le super admin a tous les droits ; l'admin perd la gestion des utilisateurs,
-- les journaux d'audit, la maintenance/qualité et les paramètres (imposé par
-- l'API, pas seulement par l'interface).
-- L'administrateur racine (bilal) devient le premier super admin.
-- ============================================================================

alter table app_users drop constraint if exists app_users_role_check;
alter table app_users
  add constraint app_users_role_check
  check (role in ('user', 'referent', 'admin', 'super_admin'));

update app_users set role = 'super_admin' where lower(username) = 'bilal';
