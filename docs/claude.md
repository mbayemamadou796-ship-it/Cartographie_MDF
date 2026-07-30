# Claude Code Instructions

## Contexte

Tu interviens sur le projet **Cartographie MDF**.

Il s'agit d'une application web interne destinée au bureau de l'association MDF (Membres & Réseau de la Diaspora / Fraternité).

L'objectif est de permettre la gestion et la consultation des membres de l'association à travers :

- un annuaire dynamique avec filtres et fiches détaillées ;
- une cartographie interactive géolocalisée (Leaflet / OpenStreetMap) ;
- une gestion des zones régionales (Bretagne, Île-de-France, Pays de la Loire, Normandie, Occitanie, PACA, etc.) ;
- une précision par commune/ville de résidence pour chaque membre au sein de sa zone ;
- un géocodage automatique intelligent de la latitude et longitude basé sur la ville et la zone (sans obligation de coordonnées GPS dans les fichiers importés) ;
- une gestion des utilisateurs et des rôles (Administrateur, Référent de Zone, Utilisateur) ;
- un import/export Excel intelligent (.xlsx) avec géocodage automatique en tâche de fond ;
- un journal complet d'audit des actions.

Le projet possède déjà une base Frontend complète et modulaire.

Ta mission consiste principalement à **terminer et fiabiliser le Backend**, tout en respectant l'architecture existante.

---

# Ton objectif

Tu dois produire un code :

- propre ;
- modulaire ;
- maintenable ;
- évolutif ;
- documenté.

Toutes les évolutions devront respecter l'architecture du projet.

Tu ne dois jamais contourner cette architecture.

---

# Stack technique

Frontend

- Vite / React / Next.js
- TypeScript
- Tailwind CSS
- Lucide React / Icons

Backend

- Node.js / Express / Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)

Validation & Parsing

- Zod
- XLSX / SheetJS

Cartographie & Géocodage

- Leaflet / React-Leaflet
- OpenStreetMap / Nominatim + Dictionnaire de géocodage offline autonome

Import / Export

- Excel (.xlsx, .csv)

---

# Architecture à respecter

Le projet est organisé de la manière suivante :

```text
frontend/web-cartographie/
├── src/
│   ├── app/
│   ├── modules/
│   │   ├── annuaire/
│   │   ├── cartographie/
│   │   ├── dashboard/
│   │   ├── import-export/
│   │   ├── journaux/
│   │   ├── maintenance/
│   │   ├── membres/
│   │   ├── parametres/
│   │   ├── utilisateurs/
│   │   └── zones/
│   ├── services/
│   ├── utils/
│   ├── data/
│   └── types.ts
backend/
shared/
docs/
infra/
scripts/
```

Toute nouvelle fonctionnalité doit être développée dans son module métier.

Aucun code métier ne doit être placé directement à la racine du projet.

---

# Backend

Le Backend est la source unique de vérité.

Toute la logique métier doit être implémentée dans le Backend.

Le Frontend ne contient aucune logique métier complexe et communique uniquement avec le Backend ou les services d'API dédiés.

---

# Base de données

Toutes les données sont stockées dans Supabase / PostgreSQL.

La base de données doit être normalisée.

Les relations doivent être explicites.

Les clés étrangères doivent être utilisées.

Les suppressions doivent respecter les contraintes d'intégrité.

### Données obligatoires du Membre

Chaque membre possède notamment :
- `nom` & `prenom` (Obligatoires)
- `zone` (Obligatoire : zone régionale de rattachement, ex: Bretagne, Île-de-France...)
- `ville` (Obligatoire : commune de résidence du frère/membre dans la zone)
- `adresse`, `codePostal`, `departement`, `pays` (Optionnels / Précisions)
- `latitude` & `longitude` (Calculés et synchronisés automatiquement via la ville et la zone)
- `situationProfessionnelle`, `domaineEtude`, `organisation`, `email`, `telephone`

---

# Authentification

Utiliser exclusivement :

- Supabase Auth

Aucun système d'authentification personnalisé ne doit être développé.

Les mots de passe ne doivent jamais être stockés manuellement.

---

# Gestion des rôles

Trois rôles existent : **Administrateur**, **Référent de Zone**, **Utilisateur** (Lecture seule).

## Initialisation du Compte Administrateur Unique

Lors du déploiement / seed de la base de données Backend, **un seul et unique compte administrateur** est créé initialement :

- **Identifiant / Email** : `Bilal`
- **Mot de passe** : `Ziguinchor1999@`
- **Rôle** : `admin` (Administrateur Racine)

C'est cet administrateur racine (`Bilal`) qui est ensuite chargé de créer les autres utilisateurs dans la plateforme (autres Administrateurs, Référents de zone, Utilisateurs en lecture seule).

---

## Administrateur

Accès complet.

Peut :

- gérer tous les membres
- gérer les zones régionales
- créer et gérer les utilisateurs ainsi que leurs rôles
- importer et exporter des fichiers Excel
- consulter les journaux d'audit
- accéder aux paramètres globaux

---

## Référent de Zone

Chaque référent est associé à une ou plusieurs zones géographiques.

Il peut uniquement :

- consulter ses zones attribuées
- consulter les membres résidant dans ses zones
- ajouter un membre dans ses zones
- modifier la fiche des membres de ses zones

Il ne doit jamais accéder aux données d'autres zones qui ne lui sont pas attribuées.

---

## Utilisateur

Lecture seule.

Aucune modification.

---

# Row Level Security (RLS)

Les politiques RLS doivent être mises en place.

Administrateur

→ accès total

Référent

→ accès uniquement aux membres de ses zones

Utilisateur

→ lecture uniquement

Aucune donnée ne doit être exposée en dehors des permissions.

---

# Import Excel Intelligent & Géocodage Automatique

Le système d'import doit être intelligent et tolérant :

Lors d'un import :

- vérifier la structure du fichier Excel (.xlsx, .csv) ;
- détecter les erreurs de formatage ou les doublons ;
- **Géocodage automatique des coordonnées GPS** : le fichier n'a pas besoin de contenir `latitude` et `longitude`. L'application calcule et synchronise automatiquement les coordonnées GPS à partir de la `ville` et de la `zone` ;
- créer les nouveaux membres ;
- mettre à jour les membres existants ;
- ne jamais supprimer automatiquement un membre ;
- produire un rapport d'import avec bilan des succès/échecs.

Les zones régionales ne doivent jamais être altérées ou supprimées par un import Excel.

---

# Gestion des Zones Régionales & Communes

Les zones régionales (Bretagne, Île-de-France, Pays de la Loire, Normandie, Occitanie, PACA, etc.) sont gérées directement dans l'application.

Dans le Dashboard, **la Zone joue le rôle de région** (le concept redondant de « Région » a été fusionné dans « Zone »).

Chaque zone possède :

- un nom (ex: Bretagne, Île-de-France...)
- une description (ex: Région Bretagne, Rennes, Brest, Quimper...)
- une couleur visuelle d'identification
- un ou plusieurs référents désignés
- une liste de membres attribués

Au sein d'une zone, chaque membre renseigne obligatoirement sa **ville de résidence** (ex: Rennes pour la zone Bretagne, Saint-Denis pour la zone Île-de-France), permettant une cartographie précise.

---

# Journaux (Audit)

Toutes les actions importantes doivent être enregistrées dans le journal d'audit (`audit_logs`) :

Exemples :

- connexion / déconnexion
- ajout / modification / suppression d'un membre
- modification du lieu de résidence d'un membre
- import ou export Excel
- création / modification d'une zone
- changement de référent de zone
- création ou modification de rôle d'un utilisateur

Chaque journal doit contenir :

- utilisateur (ID & nom)
- date et heure horodatées
- type d'action
- ressource concernée
- détails / anciennes et nouvelles valeurs

Le journal est consultable uniquement par les administrateurs.

---

# API

Toutes les opérations passent par la couche API / Backend.

Le Frontend ne doit jamais accéder directement aux tables Supabase.

Créer une couche API claire et cohérente.

Respecter les principes REST.

Utiliser des DTO (Data Transfer Objects).

Valider toutes les données d'entrée.

---

# Qualité du code

Le code doit respecter les principes suivants :

- SOLID
- DRY
- KISS

Éviter la duplication.

Créer des fonctions et composants réutilisables.

Factoriser les traitements communs (ex: utilitaire de géocodage `geocoding.ts`).

Utiliser TypeScript strict.

Ne jamais utiliser `any` sauf nécessité absolue.

---

# Conventions

Le code est écrit en anglais (interfaces, variables, types).

La documentation et les textes UI utilisateur sont écrits en français.

Les noms des variables doivent être explicites.

Les fonctions doivent être courtes et axées sur une seule responsabilité.

Chaque module doit être indépendant.

---

# Sécurité

Toutes les entrées utilisateur doivent être validées (Zod / validators).

Aucune requête SQL dynamique.

Protection contre :

- injections SQL
- attaques XSS
- accès non autorisés (contrôle RLS + middlewares server-side)

Toutes les permissions doivent être vérifiées côté serveur.

Ne jamais faire confiance au Frontend.

---

# Performance

Limiter les appels réseau inutiles.

Paginer et filtrer efficacement les listes de membres.

Utiliser le géocodage avec dictionnaire hors-ligne / fallback pour éviter de surcharger les services d'API externes.

Indexer les colonnes utilisées pour la recherche (nom, ville, zone, email).

---

# Documentation

Chaque nouveau module doit être documenté.

Chaque évolution importante doit mettre à jour la documentation du dossier `docs` (`REGLES_METIER.md`, `MAPPING_DONNEES.md`, `fonctionnalites.md`, `import-excel.md`, `database-schema.md`).

---

# Ce que tu peux modifier

- Backend (Node.js / Express / Supabase)
- Base de données / Schémas PostgreSQL & Supabase
- API REST / Handlers / Controllers
- Politiques RLS & Sécurité des routes
- Traitements serveur de fond (Géocodage asynchrone, Import/Export Excel serveur)
- Documentation technique (`docs/*`, `claude.md`)

---

# Ce que tu ne dois pas modifier (DIRECTIVE STRICTE)

Tu ne dois **STRICTEMENT PAS** :

- **Toucher ou modifier le Frontend (Design, organisation des éléments, layout UI/UX, composants visuels)** : Le design, l'organisation et la structure visuelle du Frontend sont **figés, validés et stabilisés**. **IL EST STRICTEMENT INTERDIT D'Y TOUCHER OU DE MODIFIER LE DESIGN FRONTEND**.
- Changer l'architecture globale du projet ;
- Renommer les modules métier sans justification ;
- Casser la compatibilité ou déplacer les fichiers du projet.

> ⚠️ **RÈGLE D'OR** : Le travail restant à accomplir est **EXCLUSIVEMENT AXÉ SUR LE BACKEND** (API REST, base de données Supabase/PostgreSQL, RLS, contrôleurs, scripts serveur). Le Frontend ne doit plus subir aucune modification de design ou d'organisation.

---

# Priorités

Les développements doivent être réalisés dans l'ordre suivant :

1. Base de données Supabase / PostgreSQL (Schémas Membres, Zones, Villes, Rôles)
2. Authentification Supabase Auth
3. Gestion des rôles (Admin, Référent, Utilisateur)
4. Politiques RLS & Sécurité des données
5. Gestion des utilisateurs
6. Gestion des membres & synchronisation automatique des coordonnées par Ville/Zone
7. Gestion des zones régionales
8. Import Excel intelligent avec géocodage automatique
9. Journaux d'activité (Audit logs)
10. Couche API REST
11. Optimisations & Cartographie Leaflet
12. Documentation

---

# Résultat attendu

À la fin du développement :

- le Backend doit être entièrement fonctionnel ;
- toutes les règles métier doivent être respectées (Zones régionales, Ville obligatoire par membre, Géocodage automatique) ;
- la base Supabase doit être complète et normalisée ;
- les permissions et accès par rôle/zone doivent être sécurisés via RLS ;
- le code doit être propre, modulaire et documenté ;
- le projet doit être prêt pour une mise en production.

---

# Mode de travail attendu

Avant de développer une nouvelle fonctionnalité :

1. Analyse le code existant dans `frontend/web-cartographie/src` et `docs/`.
2. Vérifie si une solution ou un utilitaire similaire existe déjà.
3. Réutilise les composants et services existants lorsque c'est possible.
4. Respecte strictement l'architecture et les conventions du projet.
5. Si une décision d'architecture est ambiguë, privilégie la solution la plus modulaire et évolutive.
6. Ne supprime jamais une fonctionnalité existante sans justification explicite.
7. À la fin de chaque tâche, résume :
   - les fichiers créés ;
   - les fichiers modifiés ;
   - les migrations réalisées ;
   - les impacts sur le projet ;
   - les étapes suivantes recommandées.
