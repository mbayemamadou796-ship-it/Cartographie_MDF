# Documentation API REST — Cartographie MDF

> Base : `http://localhost:3001/api` (dev local). Le frontend Vite (port 3000) est autorisé par CORS.
> Sauf mention contraire, toutes les routes exigent le header `Authorization: Bearer <accessToken>` (JWT Supabase obtenu au login).
> Les réponses utilisent les types canoniques de `shared/types/index.ts` (camelCase français). Le champ `password` n'apparaît **jamais** en sortie.
>
> **Modèle de synchronisation** : le frontend (figé) pousse ses collections complètes via des `PUT` bulk **upsert-only** — le serveur insère/met à jour, mais **ne supprime jamais** implicitement. Les suppressions passent par des `DELETE` explicites.

## 1. Santé

### `GET /api/health` — public
`{ "status": "ok", "service": "Cartographie MDF Backend API", "version": "1.0.0 MVP" }`

## 2. Authentification (`/api/auth`) — Supabase Auth

### `POST /api/auth/login` — public, rate-limité (5 tentatives / 15 min / IP)
- **Payload** : `{ "identifier": "bilal", "password": "..." }` — `identifier` = username **ou** email.
- **200** : `{ "user": AppUser, "accessToken": "...", "refreshToken": "..." }`
- **401** : identifiants incorrects · **403** : `{ "error": "...", "reason": "disabled" }` compte désactivé · **429** : trop de tentatives.

### `POST /api/auth/refresh` — public
`{ "refreshToken": "..." }` → `{ "accessToken", "refreshToken" }` (401 si expiré).

### `POST /api/auth/logout` — authentifié
Révoque la session Supabase. → 204.

## 3. Bootstrap

### `GET /api/bootstrap` — authentifié
Hydratation complète du frontend en un appel :
```json
{
  "settings": { "appName": "...", "...": "...", "lastUpdateDate": "..." },
  "members": [Member], "zones": [CustomZone],
  "users": [AppUser],      // admin uniquement, sinon []
  "importLogs": [ImportLog], // admin uniquement, sinon []
  "auditLogs": [AuditLog],   // admin uniquement, sinon []
  "currentUser": AppUser
}
```

## 4. Membres

| Route | Rôle | Comportement |
|---|---|---|
| `PUT /api/members` (`Member[]`) | admin, referent* | Upsert bulk, jamais de suppression. → 204 |
| `DELETE /api/members/:id` | admin | Supprime le membre **et** retire son id des `memberIds` de toutes les zones. → 204 |

\* **referent** : seules les lignes de son périmètre (zones attribuées via `assignedZoneIds` / `referentUserId`, ou correspondance de nom zone/région) sont appliquées ; les autres sont **ignorées silencieusement** (204) car la synchronisation automatique du frontend peut pousser des états hors périmètre sans intention. Rôle `user` : no-op 204.

## 5. Zones

| Route | Rôle | Comportement |
|---|---|---|
| `PUT /api/zones` (`CustomZone[]`) | admin, referent (ses zones, pas de création) | Upsert bulk. → 204 |
| `DELETE /api/zones/:id` | admin | Supprime la zone (jamais ses membres). → 204 |

## 6. Utilisateurs (admin)

| Route | Comportement |
|---|---|
| `PUT /api/users` (`AppUser[]`, `password` optionnel par entrée) | Upsert bulk. Un `password` fourni est routé vers l'**Auth Admin API Supabase** (création du compte Auth ou changement de mot de passe), jamais stocké en table. → 204, ou 207 `{ errors: [] }` si certains comptes ont échoué. Non-admin : no-op 204. |
| `DELETE /api/users/:id` | Supprime le compte applicatif **et** le compte Supabase Auth lié. 409 si : suppression de son propre compte, ou du dernier administrateur actif. → 204 |

## 7. Journal d'audit

### `POST /api/audit-logs` — authentifié
Ajoute une entrée (`AuditLog`). **L'identité (`userId`, `userName`, `userRole`) est forcée côté serveur depuis le token** — le payload client n'est pas cru. → 201.
La lecture passe par `/api/bootstrap` (admin uniquement, 500 entrées max, plus récentes d'abord).

## 8. Historique des imports

### `PUT /api/import-logs` (`ImportLog[]`) — admin (non-admin : no-op 204)
Upsert bulk. → 204. Le parsing Excel et le géocodage restent côté client (frontend figé) : l'API ne fait que persister les résultats.

## 9. Paramètres

### `PUT /api/settings` — admin (non-admin : no-op 204)
`Partial<AppSettings> & { lastUpdateDate?: string }` — merge sur la ligne unique. `logoUrl` accepte une data-URL base64 (limite globale de payload : 50 Mo). → 204.

## Erreurs

Format uniforme : `{ "error": "message lisible" }`.
`400` payload invalide (zod) · `401` non authentifié / session expirée · `403` privilèges insuffisants ou compte désactivé · `409` conflit (suppressions interdites) · `429` rate-limit login · `500` erreur interne (détails jamais exposés, loggés serveur).
