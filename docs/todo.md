# Liste des Tâches de Développement (TODO) — Cartographie MDF

> ⛔ **IMPORTANT** : Le Frontend (design, organisation des éléments, composants UI/UX) est **finalisé et stabilisé — NE PAS Y TOUCHER**. Les travaux restants portent uniquement sur le **Backend** (base de données, API, sécurité, Supabase).

## 🛠️ Architecture & Code Base
- [x] Séparer proprement l'application dans `frontend/web-cartographie/src`.
- [x] Centraliser les types TypeScript canoniques dans `shared/types/index.ts`.
- [x] Définir les validateurs de données dans `shared/validators/memberValidator.ts`.
- [x] Valider le linting TypeScript (`tsc --noEmit`) sans aucune erreur.

## 🎨 UI & Cartographie
- [x] Intégrer la carte dynamique Leaflet avec marqueurs personnalisés.
- [x] Permettre le basculement rapide entre la vue Annuaire et la vue Cartographique.
- [x] Ajouter le panneau latéral de filtres multi-critères (Domaine, Situation pro, Zone).
- [x] Rendre interactives les métriques (Villes, Départements, Zones, Membres) par fenêtre modale de détail et centrage sur carte.

## 📊 Base de Données & Backend
- [x] Configurer la structure des tables SQL Supabase (`members`, `custom_zones`, `app_users`, `audit_logs`, `import_logs`, `app_settings`) — `backend/database/migrations/001_init.sql`.
- [x] Configurer le compte administrateur racine unique (username `bilal` / email `salyndiayembaye@gmail.com`) via Supabase Auth + seed (`npm run seed`).
- [x] Développer l'API Backend Express (auth Supabase, bootstrap, PUT bulk membres/zones/users, audit, imports, settings) — `npm run dev:api`.
- [x] Câbler le frontend sur l'API (couche données uniquement : `apiService.ts`, `App.tsx`) sans toucher au design.
- [x] Finaliser l'intégration des clés Supabase (`.env`).
- [x] Intégrer le frontend amélioré (module Demandes + application web-formulaire) depuis Cartographie_MDF1.
- [x] Backend des demandes d'adhésion : table `demandes` (`003_demandes.sql`), endpoints publics (soumission + suivi rate-limités) et bureau (bootstrap, `PUT /api/demandes` admin), synchronisation frontend.
- [x] ⚠️ Exécuter `backend/database/migrations/003_demandes.sql` dans Supabase > SQL Editor (fait le 08/08/2026).
- [x] Rôle `super_admin` (tous droits) + restriction des onglets admin ; lien utilisateur⇄membre automatique ; villes proposées par zone ; géolocalisation auto par ville ; référents assignables sur les zones orphelines ; correctif enregistrement des paramètres.
- [ ] ⚠️ Exécuter `backend/database/migrations/004_super_admin.sql` dans Supabase > SQL Editor (sans cela, `bilal` reste simple admin et perd les onglets Utilisateurs / Journaux / Paramètres).
- [ ] Exécuter des tests de charge sur les imports massifs Excel (> 5000 enregistrements).
