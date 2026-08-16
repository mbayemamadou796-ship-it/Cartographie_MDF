# 🚀 Guide de déploiement — Cartographie MDF (Vercel + Render)

Ce guide explique comment mettre en ligne les **deux applications** avec une URL publique chacune :

| Application | Exemple d'URL publique | Hébergeur |
| :--- | :--- | :--- |
| **Bureau / Cartographie** (espace connecté) | `https://mdf-bureau.vercel.app` | Vercel |
| **Formulaire public** (inscriptions membres) | `https://mdf-formulaire.vercel.app` | Vercel |
| **API backend** (Express) | `https://mdf-api.onrender.com` | Render |

## 🧠 Comprendre l'architecture en 30 secondes

Le projet a 3 morceaux, et ils ne se déploient pas au même endroit :

```
Bureau (Vercel, statique) ──┐
                            ├──→  API Express (Render, serveur permanent)  ──→  Supabase (déjà en ligne)
Formulaire (Vercel, statique) ┘
```

- Les deux frontends sont des **sites statiques** (HTML/JS générés par `vite build`) → parfaits pour Vercel.
- L'API Express est un **serveur qui tourne en continu** → Vercel ne sait pas l'héberger telle quelle ; Render (ou Railway) l'accepte sans modifier le code.
- Supabase (la base de données) est déjà dans le cloud : **rien à faire**.

**L'ordre compte** : on déploie d'abord l'API (étape 1), car les frontends ont besoin de son URL. Puis on revient sur Render pour renseigner les URL Vercel dans le CORS (étape 3).

## ✅ Prérequis

- Le repo GitHub `mbayemamadou796-ship-it/Cartographie_MDF` à jour (`git push` fait).
- Un compte [vercel.com](https://vercel.com) et un compte [render.com](https://render.com) (connexion « Continue with GitHub » recommandée : les repos sont détectés automatiquement).
- Les 3 clés Supabase du `.env` local sous la main (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). ⚠️ Elles se transmettent en privé, jamais dans git.

---

## Étape 0 — Migrations Supabase (avant tout déploiement)

L'API et la base doivent parler le même langage : **toutes les migrations SQL
doivent être exécutées** dans Supabase avant (ou juste après) chaque mise en
production. C'est manuel et ça prend 1 minute chacune :

**Supabase → ton projet → SQL Editor → coller le fichier → Run.**

| Migration (dossier `backend/database/migrations/`) | Rôle | État |
| :--- | :--- | :--- |
| `001_init.sql` | tables de base (membres, zones, comptes…) | ✅ déjà exécutée |
| `002_audit_details.sql` | journal d'audit enrichi | ✅ déjà exécutée |
| `003_demandes.sql` | demandes d'inscription du formulaire public | ✅ déjà exécutée |
| `004_super_admin.sql` | rôle super admin (bilal) | ✅ déjà exécutée |
| `005_zone_referents.sql` | référents désignés par membre de zone | ✅ déjà exécutée |
| `006_weekly_reports.sql` | **reporting hebdomadaire des référents** | ⚠️ **À EXÉCUTER** |

> Règle pour la suite : à chaque nouvelle migration `00X_*.sql` qui apparaît
> dans un `git pull`, l'exécuter une fois dans le SQL Editor (les scripts sont
> relançables sans danger). Une seule exécution suffit pour toute l'équipe :
> vous partagez le même projet Supabase.

---

## Étape 1 — Déployer l'API sur Render

1. Sur [dashboard.render.com](https://dashboard.render.com) → **New → Web Service** → sélectionne le repo `Cartographie_MDF`.
2. Renseigne :

   | Champ | Valeur |
   | :--- | :--- |
   | **Name** | `mdf-api` (libre — détermine l'URL) |
   | **Region** | Frankfurt (EU) — le plus proche de la France |
   | **Branch** | `main` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free (pour commencer) |

3. Section **Environment Variables** — ajoute :

   ```
   SUPABASE_URL              = https://TON-PROJET.supabase.co
   SUPABASE_ANON_KEY         = (clé anon du .env local)
   SUPABASE_SERVICE_ROLE_KEY = (clé service_role du .env local)
   CORS_ORIGIN               = (laisser vide pour l'instant — rempli à l'étape 3)
   ```

   > Pas besoin de variable de port : Render fournit `PORT` automatiquement et le serveur la lit (`backend/api/server.ts`).

4. **Create Web Service**. À la fin du déploiement, note l'URL affichée en haut, par ex. `https://mdf-api.onrender.com`.
5. Test rapide : ouvre `https://mdf-api.onrender.com/api/bootstrap` dans le navigateur → une réponse JSON d'erreur d'authentification (`401`) est **normale** et prouve que l'API répond.

---

## Étape 2 — Créer les deux projets Vercel

Un même repo GitHub peut alimenter plusieurs projets Vercel : on l'importe **deux fois**, avec des réglages de build différents.

### Projet n°1 : le Bureau / Cartographie

1. [vercel.com](https://vercel.com) → **Add New… → Project** → **Import** sur `Cartographie_MDF`.
2. Renseigne :

   | Champ | Valeur |
   | :--- | :--- |
   | **Project Name** | `mdf-bureau` (libre — détermine l'URL) |
   | **Framework Preset** | Vite |
   | **Root Directory** | `./` (racine — ne pas changer) |
   | **Build Command** (Override) | `npm run build` |
   | **Output Directory** (Override) | `frontend/web-cartographie/dist` |

3. Section **Environment Variables** :

   ```
   VITE_API_URL         = https://mdf-api.onrender.com
   VITE_FORMULAIRE_URL  = https://mdf-formulaire.vercel.app
   ```

   (sans `/` final ; `VITE_FORMULAIRE_URL` = l'URL du projet n°2 ci-dessous — si tu ne la connais pas encore, mets la valeur prévue, elle est prévisible : `https://<nom-du-projet>.vercel.app`)

4. **Deploy** → tu obtiens `https://mdf-bureau.vercel.app`.

### Projet n°2 : le Formulaire public

Même démarche (**Add New… → Project**, réimporte le même repo) :

| Champ | Valeur |
| :--- | :--- |
| **Project Name** | `mdf-formulaire` |
| **Framework Preset** | Vite |
| **Root Directory** | `./` (racine) |
| **Build Command** (Override) | `npm run build:formulaire` |
| **Output Directory** (Override) | `frontend/web-formulaire/dist` |

Variable d'environnement :

```
VITE_API_URL = https://mdf-api.onrender.com
```

**Deploy** → tu obtiens `https://mdf-formulaire.vercel.app`.

---

## Étape 3 — Boucler le CORS (obligatoire)

Sans cette étape, les navigateurs bloqueront tous les appels des frontends vers l'API (« Serveur inaccessible » au login, formulaire qui ne s'envoie pas).

1. Retourne sur Render → service `mdf-api` → **Environment**.
2. Renseigne `CORS_ORIGIN` avec **les deux URL Vercel exactes**, séparées par une virgule, sans espace ni `/` final :

   ```
   CORS_ORIGIN = https://mdf-bureau.vercel.app,https://mdf-formulaire.vercel.app
   ```

3. Sauvegarde — Render redémarre l'API automatiquement.

---

## ✅ Vérification finale

1. **Formulaire** : ouvre `https://mdf-formulaire.vercel.app` → soumets une inscription de test → message de confirmation avec un identifiant `dem-...`. Resoumets avec le même e-mail → message « Vous avez déjà envoyé votre demande » (anti-doublon OK).
2. **Bureau** : ouvre `https://mdf-bureau.vercel.app` → connecte-toi (super admin `bilal`) → onglet **Demandes Inscription** → la demande de test apparaît (patiente jusqu'à 15 s, le bureau se rafraîchit périodiquement).
3. **Reporting** : onglet **Remontées Référents** → avec un compte référent, soumets un reporting de test → reconnecte-toi en super admin (autre navigateur ou onglet privé) → la remontée apparaît. Si elle ne traverse pas les appareils : la migration `006_weekly_reports.sql` n'a pas été exécutée (étape 0).

## 🔄 Et ensuite ? C'est automatique

Les trois services sont branchés sur la branche `main` : **chaque `git push` redéploie tout automatiquement** (les deux projets Vercel et Render détectent le commit). La seule chose qui reste manuelle : **exécuter les nouvelles migrations SQL** dans Supabase quand il y en a (étape 0).

## ⚠️ Pièges connus & dépannage

- **Les variables `VITE_*` sont figées au moment du build.** Si tu ajoutes/modifies `VITE_API_URL` ou `VITE_FORMULAIRE_URL` après coup, il faut relancer un déploiement : Vercel → projet → **Deployments** → `⋯` sur le dernier → **Redeploy**.
- **Render Free s'endort après ~15 min d'inactivité** : le premier appel suivant prend ~30–60 s (login qui affiche « Serveur inaccessible » le temps du réveil — réessayer suffit). L'instance payante (~7 $/mois) supprime ce comportement.
- **Erreur CORS dans la console du navigateur** (`blocked by CORS policy`) : `CORS_ORIGIN` sur Render ne correspond pas exactement aux URL Vercel (vérifie `https`, l'absence de `/` final, la virgule sans espace).
- **Page blanche sur Vercel** : Build Command ou Output Directory incorrects — revérifie les overrides du tableau ci-dessus (c'est la seule différence entre les deux projets).
- **`401` sur `/api/bootstrap`** : normal sans être connecté. **`500`** : clés Supabase mal recopiées dans Render.

## 🌐 Nom de domaine personnalisé (optionnel)

Chaque projet Vercel accepte un domaine : projet → **Settings → Domains** (ex. `carto.mbokdefrance.org` et `formulaire.mbokdefrance.org`). Après ajout, mets à jour `VITE_FORMULAIRE_URL` (projet bureau) et `CORS_ORIGIN` (Render) avec les nouveaux domaines, puis Redeploy.
