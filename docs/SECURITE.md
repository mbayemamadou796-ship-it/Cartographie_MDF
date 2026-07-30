# Politiques & Règles de Sécurité — Cartographie MDF

Ce document définit l'ensemble des exigences, normes et règles de sécurité à mettre en œuvre pour l'application **Cartographie MDF (Mbok de France)** afin de garantir l'intégrité, la confidentialité et la disponibilité des données de l'association, et de prévenir les cyberattaques (MitM, Injection SQL, XSS, CSRF, Brute Force, etc.).

---

## 1. Protection contre les Attaques Man-in-the-Middle (MitM)

Les attaques *Man-in-the-Middle* visent à intercepter ou altérer les communications entre l'utilisateur et le serveur.

### Règles d'application :
1. **Obligation HTTPS / TLS 1.3** :
   - Tous les flux de données (Web, API REST, WebSockets, téléversement de fichiers) doivent obligatoirement utiliser HTTPS sécurisé avec TLS 1.3 (ou TLS 1.2 au minimum).
   - Redirection automatique de tout le trafic HTTP (port 80) vers HTTPS (port 443).
2. **Configuration HSTS (HTTP Strict Transport Security)** :
   - Activation de l'en-tête HSTS : `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.
3. **Sécurisation des Cookies et Jetons** :
   - Tout cookie contenant des informations de session ou des jetons JWT doit posséder les attributs :
     - `HttpOnly` : empêche la lecture par les scripts JavaScript côté client (protection XSS).
     - `Secure` : garantit l'envoi du cookie uniquement via un canal HTTPS.
     - `SameSite=Strict` (ou `SameSite=Lax`) : empêche l'envoi du cookie lors de requêtes cross-site tierces (protection CSRF).

---

## 2. Prévention des Injections SQL / NoSQL / Commandes

Les injections se produisent lorsque des données non fiables fournies par l'utilisateur sont directement exécutées par un interpréteur de base de données ou de commandes système.

### Règles d'application :
1. **Requêtes Préparées & ORM / ODM Obligatoires** :
   - **Interdiction absolue** de construire des requêtes SQL par concaténation de chaînes de caractères (ex: `SELECT * FROM members WHERE email = '` + email + `'`).
   - Utiliser exclusivement des **requêtes paramétrées** ou un ORM sécurisé (ex: Prisma, Drizzle, TypeORM, Knex) qui échappe automatiquement les paramètres.
2. **Validation stricte des entrées API (Input Validation)** :
   - Utiliser des schémas de validation typés avec **Zod** ou **Joi** sur chaque point de terminaison Express/Node.js :
     ```typescript
     import { z } from 'zod';

     export const MemberInputSchema = z.object({
       nom: z.string().min(2).max(50).trim(),
       prenom: z.string().min(2).max(50).trim(),
       email: z.string().email(),
       telephone: z.string().regex(/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/),
       ville: z.string().min(1).max(100).trim(),
     });
     ```
3. **Principe du Moindre Privilège pour la Base de Données** :
   - L'utilisateur de base de données utilisé par l'application Web ne doit disposer que des privilèges nécessaires (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).
   - Les droits d'administration de structure (`DROP`, `ALTER`, `GRANT`) sont strictement réservés aux scripts de migration contrôlés.

---

## 3. Prévention du Cross-Site Scripting (XSS) & CSRF

Le Cross-Site Scripting (XSS) permet à un attaquant d'injecter des scripts malveillants exécutés dans le navigateur des utilisateurs.

### Règles d'application :
1. **Échappement automatique React & DOMPurify** :
   - Ne jamais utiliser `dangerouslySetInnerHTML` en React sans avoir préalablement assaini la chaîne de caractères avec **DOMPurify**.
2. **Politique de Sécurité du Contenu (Content Security Policy - CSP)** :
   - Configurer l'en-tête HTTP CSP au niveau du reverse proxy Nginx ou du middleware Express (`helmet`) :
     ```http
     Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org; frame-ancestors 'self';
     ```
3. **En-têtes de Sécurité HTTP Recommandés** :
   - `X-Content-Type-Options: nosniff` (empêche le MIME-sniffing)
   - `X-Frame-Options: SAMEORIGIN` (empêche le clickjacking)
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
4. **Protection Anti-CSRF** :
   - Vérification de l'en-tête `Origin` / `Referer` sur toutes les requêtes de modification (POST, PUT, DELETE, PATCH).
   - Utilisation de cookies de session avec `SameSite=Lax` ou `SameSite=Strict`.

---

## 4. Authentification Sécurisée et Gestion des Mots de Passe

L'authentification est la porte d'entrée de l'application. Elle doit résister aux attaques par force brute, dictionnaire et vol d'identifiants.

### Règles d'application :
1. **Hachage Robuste des Mots de Passe** :
   - Aucun mot de passe ne doit être stocké en clair.
   - Utiliser **Argon2id** ou **bcrypt** avec un sel (*salt*) cryptographique unique par utilisateur et un facteur de coût minimal de 12.
2. **Politique de Mots de Passe Forts** :
   - Longueur minimale de 12 caractères.
   - Requis : combinaison de majuscules, minuscules, chiffres et caractères spéciaux.
3. **Protection contre le Brute-Force (Rate Limiting)** :
   - Activer `express-rate-limit` sur la route `/api/login` :
     - Maximum 5 tentatives de connexion par adresse IP sur une fenêtre de 15 minutes.
     - Verrouillage temporaire du compte en cas de tentatives répétées échouées.
4. **Gestion des Jetons JWT** :
   - *Access Tokens* à durée de vie courte (15 à 30 minutes maximum).
   - *Refresh Tokens* stockés de façon sécurisée en cookie `HttpOnly` et `Secure`, révocables en base de données.
5. **Suppression des Comptes / Mots de Passe de Démo en Production** :
   - Interdiction d'afficher des identifiants et mots de passe de démonstration en clair sur la page de connexion publique.

---

## 5. Contrôle d'Accès Basé sur les Rôles (RBAC) & Sécurité API

Le contrôle d'accès garantit qu'un utilisateur ne peut accéder qu'aux fonctionnalités et données correspondant à son rôle (`admin`, `referent`, `user`).

### Règles d'application :
1. **Contrôle d'Accès Strict Côté Serveur (Server-Side Enforcement)** :
   - La vérification des droits ne doit **jamais** reposer uniquement sur le masquage d'éléments d'interface côté React (CSS/UI).
   - Chaque route API protégée doit exécuter un middleware de vérification du rôle :
     ```typescript
     export function requireRole(allowedRoles: UserRole[]) {
       return (req: Request, res: Response, next: NextFunction) => {
         if (!req.user || !allowedRoles.includes(req.user.role)) {
           return res.status(403).json({ error: 'Accès refusé : privilèges insuffisants.' });
         }
         next();
       };
     }
     ```
2. **Isolation du Périmètre des Référents (Scope Isolation)** :
   - Un utilisateur avec le rôle `referent` ne peut lire, éditer ou exporter que les membres appartenant à sa zone d'attribution validée côté serveur.
   - Dans le sous-module de cartes des zones (`GeographicZonesView`), le composant filtre strictement les zones affichées pour que seules les zones assignées soient retournées au navigateur client.
3. **Réinitialisation Sécurisée des Onglets de Navigation (Tab Security Guard)** :
   - L'application client intègre un garde-fou dynamique qui bascule automatiquement l'onglet actif vers la vue publique/annuaire (`directory`) lorsqu'un utilisateur non-administrateur se connecte ou lorsque la session expire, empêchant l'accès direct par URL ou rétention d'état aux sous-modules d'administration (`users`, `quality`, `import_export`, `audit_logs`, `settings`).

---

## 6. Sécurité des Fichiers Téléversés (Import Excel & Médias)

L'importation de fichiers (ex: fichiers `.xlsx` d'annuaire) comporte des risques de déni de service (Zip Bomb), de téléversement de scripts exécutables ou d'injections de formules (CSV/Excel Injection).

### Règles d'application :
1. **Validation du Type MIME et de la Signature Binaire** :
   - Ne pas se fier uniquement à l'extension du fichier (`.xlsx`). Valider les octets d'en-tête (*magic bytes*).
2. **Limitation de la Taille des Fichiers** :
   - Limite maximale de 10 Mo pour les fichiers Excel et 2 Mo pour les photos de profil.
3. **Protection contre l'Injection de Formules Excel (CSV/Formula Injection)** :
   - Désactiver l'exécution des formules lors du traitement des cellules ou nettoyer les caractères de tête suspects (`=`, `+`, `-`, `@`, `\t`, `\r`).
4. **Stockage Sécurisé & Renommage** :
   - Générer un nom de fichier unique et imprédictible (UUID v4) lors de la sauvegarde sur le serveur/S3.
   - Ne jamais exécuter de fichier téléversé dans le répertoire d'upload.

---

## 7. Protection de la Confidentialité des Données (RGPD) & Journaux d'Audit

L'association traite des données à caractère personnel (nom, prénom, téléphone, email, adresse, profession).

### Règles d'application :
1. **Chiffrement au Repos (Encryption at Rest)** :
   - Chiffrement AES-256 de la base de données et des sauvegardes (*backups*).
2. **Masquage dans les Journaux d'Application (Log Sanitization)** :
   - Masquer ou exclure systématiquement des logs d'application :
     - Les mots de passe en clair ou hachés,
     - Les jetons JWT / cookies de session,
     - Les numéros de téléphone et emails complets dans les traces de débogage.
3. **Traçabilité et Journal d'Audit** :
   - Consigner dans le journal d'audit (`audit_logs`) toute action critique :
     - Connexion / Déconnexion,
     - Modification de rôle ou de droits utilisateur,
     - Importation / Exportation massive d'annuaire,
     - Suppression de membres ou de zones.

---

## 8. Gestion des Secrets et Intégration Continue (CI/CD)

### Règles d'application :
1. **Aucun Secret en Clair dans le Code Source** :
   - Interdiction formelle de commiter des clés API, secrets JWT ou mots de passe dans Git.
   - Utiliser des variables d'environnement déclarées dans `.env` (non versionné) ou gérées via Secret Manager (GCP Secret Manager / Vault).
2. **Analyse Automatisée des Dépendances & Vulnérabilités** :
   - Exécution régulière de `npm audit` et Snyk/Dependabot pour corriger immédiatement toute vulnérabilité connue (*CVE*) dans les packages npm.
