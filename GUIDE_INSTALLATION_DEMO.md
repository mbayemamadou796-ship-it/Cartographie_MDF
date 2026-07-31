# 🚀 Guide d'installation & démo — Cartographie MDF

Salut ! 🎉 Grosse mise à jour sur **Cartographie MDF** : l'appli ne stocke plus rien dans le navigateur, elle a maintenant un **vrai backend** connecté à une base de données en ligne. Voici tout ce qu'il faut savoir pour la faire tourner chez toi.

## 🧠 Comprendre en 30 secondes (si tu ne connais pas Supabase)

**Supabase** = une base de données PostgreSQL hébergée dans le cloud (comme un Google Drive, mais pour des données). Notre base est **déjà créée et remplie** — les membres, zones et comptes y sont stockés. Concrètement :

```
Ton navigateur (React, port 3000)  →  API locale (Express, port 3001)  →  Supabase (cloud)
```

Le frontend ne parle **jamais** directement à Supabase : il passe par l'API qui tourne sur ta machine et qui vérifie qui tu es et ce que tu as le droit de faire. Les clés dans le fichier `.env` sont le « mot de passe » qui permet à l'API de parler à Supabase. **Comme on partage la même base cloud, tout ce que tu crées/modifies, je le vois aussi (et inversement).**

## 🛠️ Installation (une seule fois)

1. Installe **Node.js** (version 20 ou +) si ce n'est pas fait : <https://nodejs.org>

2. Récupère le code :

   ```powershell
   git clone https://github.com/mbayemamadou796-ship-it/Cartographie_MDF
   cd Cartographie_MDF
   npm install
   ```

   (si tu as déjà le repo : `git pull` suffit)

3. **Copie le fichier `.env.example` et renomme la copie en `.env`** (à la racine du projet). Remplace les 3 valeurs `SUPABASE_...` par les vraies clés **que je t'envoie en privé** (jamais par un canal public, jamais dans git). Le reste du fichier ne change pas.

4. **Rien à faire côté Supabase** : j'ai déjà exécuté les scripts SQL et rempli la base. Ton `.env` suffit.

## ▶️ Lancer l'appli (à chaque fois)

Ouvre **deux terminaux** dans le dossier du projet :

```powershell
# Terminal 1 — le backend (laisse-le tourner)
npm run dev:api      # → "API Cartographie MDF démarrée sur http://localhost:3001"

# Terminal 2 — le frontend
npm run dev          # → ouvre http://localhost:3000 dans ton navigateur
```

Connexion : identifiant **`bilal`** — je t'envoie le mot de passe en privé.

⚠️ Au tout premier lancement, vide le cache : `F12` → onglet **Application** → **Local Storage** → clic droit sur le site → **Clear**, puis recharge la page.

### 🆘 Dépannage rapide

- **« EADDRINUSE: address already in use :::3001 »** → un ancien backend tourne encore. Dans PowerShell :

  ```powershell
  Get-NetTCPConnection -LocalPort 3001 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
  ```

- **« Could not read package.json »** → tu n'es pas dans le bon dossier : fais `cd Cartographie_MDF` d'abord.
- **« Serveur inaccessible » au login** → le Terminal 1 (`npm run dev:api`) n'est pas lancé.

## 🔐 À faire ensemble : changer le mot de passe de Bilal

L'ancien mot de passe traîne en clair dans les fichiers de `docs/` du repo, il faut le changer. Depuis l'appli : **onglet Utilisateurs → compte Bilal → modifier → nouveau mot de passe**.

⚠️ C'est un compte **partagé** (même base cloud) : décide du nouveau mot de passe **avec moi** avant, sinon l'un de nous deux sera bloqué.

## 🎤 Conseils pour ta démo live de demain

### Avant (le soir même, pas 5 min avant)

- Fais un lancement complet de test : les 2 terminaux + login + clique partout. Chronomètre-toi.
- Garde les 2 terminaux **déjà lancés** avant de commencer la présentation (le démarrage n'a aucun intérêt pour le public).
- Prends des **captures d'écran de secours** de chaque écran au cas où (wifi capricieux, etc.). L'appli a un mode secours : si l'API/Internet tombe, elle continue sur son cache local — pas de panique si tu vois un warning dans la console.

### Scénario de démo qui marche bien (~8 min)

1. **Écran de connexion** → login `bilal` (montre que c'est une vraie authentification sécurisée).
2. **Dashboard** : les indicateurs clés, clique sur une métrique pour la modale de détail.
3. **Annuaire** : recherche + filtres (par zone, profession…), ouvre une fiche membre.
4. **Le moment « waouh »** : crée un nouveau membre (mets une ville réelle, ex. Brest) → montre qu'il apparaît **instantanément sur la carte, géolocalisé automatiquement** → puis **recharge la page (F5)** : il est toujours là, car sauvegardé dans la base cloud. C'est LA différence avec avant.
5. **Carte interactive** : zoome sur une région, clique sur des marqueurs.
6. **Zones géographiques** : montre une zone, ses membres, son référent.
7. **Import Excel** : onglet Import/Export → télécharge le modèle → réimporte-le → montre le rapport d'import.
8. **Journal d'audit** : montre que chaque action est tracée (qui, quoi, quand) — ça fait très pro.

### Phrase clé pour expliquer l'architecture au jury

> « Le frontend React est servi en local, il communique avec une API Node/Express qui centralise la sécurité et les règles métier, et les données sont persistées dans une base PostgreSQL cloud (Supabase) avec authentification et contrôle d'accès par rôles. »

### À éviter pendant la démo

- Ne supprime pas de membres/zones (c'est notre vraie base partagée 😅).
- Ne montre **jamais** le fichier `.env` à l'écran.

Bonne chance pour demain 💪
