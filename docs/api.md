# Documentation des Endpoints API REST — Cartographie MDF

## Base URL : `/api`

### 1. Endpoints Membres (`/api/members`)
- `GET /api/members` : Récupère la liste des membres.
  - *Query Params* : `search`, `zoneId`, `profession`, `domainOfStudy`, `qualityFilter`, `page`, `limit`
- `GET /api/members/:id` : Détails complets d'un membre.
- `POST /api/members` : Crée un nouveau membre.
- `PUT /api/members/:id` : Met à jour la fiche d'un membre.
- `DELETE /api/members/:id` : Supprime un membre (Admin uniquement).

### 2. Endpoints Zones Géographiques (`/api/zones`)
- `GET /api/zones` : Liste des zones personnalisées avec effectifs associés.
- `POST /api/zones` : Crée une nouvelle zone géographique.
- `PUT /api/zones/:id` : Modifie le périmètre ou les référents d'une zone.
- `DELETE /api/zones/:id` : Supprime une zone.

### 3. Endpoints Import / Export (`/api/import-export`)
- `POST /api/import/excel` : Upload et traitement du fichier Excel.
- `GET /api/export/excel` : Génère le fichier Excel des membres filtrés.
- `GET /api/import-logs` : Récupère l'historique des opérations d'importation.

### 4. Endpoints Utilisateurs & Audit (`/api/users`, `/api/audit-logs`)
- `GET /api/users` : Liste des utilisateurs système et leurs rôles.
- `PUT /api/users/:id/role` : Modification du rôle ou des zones d'un utilisateur.
- `GET /api/audit-logs` : Consultation des journaux d'audit.
