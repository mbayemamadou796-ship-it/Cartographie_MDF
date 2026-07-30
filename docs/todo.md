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
- [x] Configurer la structure des tables SQL Supabase (`members`, `custom_zones`, `app_users`, `audit_logs`).
- [x] Configurer le compte administrateur racine unique par défaut (`Bilal` / `Ziguinchor1999@`) pour la création ultérieure des utilisateurs.
- [x] Développer l'API Backend Express pour servir le frontend et la gestion d'import/export.
- [ ] Finaliser l'intégration des clés de production Supabase.

- [ ] Exécuter des tests de charge sur les imports massifs Excel (> 5000 enregistrements).
