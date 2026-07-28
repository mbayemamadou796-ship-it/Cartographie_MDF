# Documentation API REST — Cartographie MDF

## 1. Endpoints d'Authentification (`/api/auth`)

### `POST /api/auth/login`
Authentifie un utilisateur et retourne le profil avec les permissions associées.
- **Payload** :
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Réponse 200 OK** :
  ```json
  {
    "success": true,
    "user": {
      "id": "usr-admin",
      "name": "Administrateur MDF",
      "email": "admin@mbokdefrance.org",
      "role": "admin"
    },
    "token": "jwt_token_here"
  }
  ```

---

## 2. Endpoints Membres (`/api/members`)

### `GET /api/members`
Récupère la liste des membres, filtrée automatiquement selon le rôle et le périmètre de l'utilisateur connecté.
- **Query Params (Optionnels)** : `q`, `region`, `departement`, `zoneId`, `qualityFilter`, `page`, `limit`.

### `POST /api/members`
Crée un nouveau membre (Réservé `admin` et `referent` dans sa zone).

### `PUT /api/members/:id`
Met à jour un membre existant. Génère un log d'audit.

### `DELETE /api/members/:id`
Supprime un membre (Réservé `admin`).

---

## 3. Endpoints Zones (`/api/zones`)

### `GET /api/zones`
Récupère la liste des zones sur-mesure et leurs référents.

### `POST /api/zones`
Crée une nouvelle zone personnalisée (`admin`).

### `PUT /api/zones/:id/members`
Met à jour l'affectation des membres dans une zone.

---

## 4. Endpoints Import / Export (`/api/import-export`)

### `POST /api/import-export/import`
Traite le fichier Excel, exécute le géocodage et retourne le compte-rendu.

### `GET /api/import-export/export`
Génère le téléchargement d'un fichier Excel `.xlsx` filtré selon les droits.
