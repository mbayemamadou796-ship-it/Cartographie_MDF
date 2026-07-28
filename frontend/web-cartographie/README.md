# Frontend Web Cartographie MDF

Ce dossier contient l'application web React / TypeScript / Vite pour la cartographie interactive et l'annuaire synchronisé de Mbok de France.

## Architecture des dossiers (`src/`) :
- `app/` : Composant racine et layout global (`App.tsx`).
- `modules/` : Modules métier fonctionnels :
  - `dashboard/` : Synthèse et indicateurs
  - `authentification/` : Gestion des sessions et accès RBAC
  - `annuaire/` : Liste dynamique, filtres et cartes de membres
  - `cartographie/` : Carte OpenStreetMap / Leaflet interactive
  - `membres/` : Fiches membres, formulaires et alertes
  - `zones/` : Découpage territorial et référents
  - `utilisateurs/` : Administration des accès
  - `import-export/` : Traitement des fichiers Excel
  - `journaux/` : Logs d'audit et traçabilité
  - `maintenance/` : Qualité des données et dédoublonnage
  - `parametres/` : Branding et préférences
- `components/` : Composants transversaux (`Header.tsx`, `NavigationTabs.tsx`)
- `services/` : Client API et géocodage
- `hooks/` : Custom React hooks (`useAuth`, `useMembers`)
- `types/` : Déclarations de types TypeScript
- `utils/` : Excel, CSV et géocodage
