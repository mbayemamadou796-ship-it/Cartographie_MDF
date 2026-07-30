# Architecture Technique & Fonctionnelle — Cartographie MDF

## 1. Vue d'ensemble

> ⛔ **DIRECTIVE DE DÉVELOPPEMENT** : L'interface utilisateur Frontend (design, organisation visuelle, layout UI/UX et composants React) est **intégralement finalisée et stabilisée**. **IL NE FAUT PLUS Y TOUCHER**. L'ensemble des développements futurs est strictement concentré sur le **Backend** (API REST, base de données Supabase / PostgreSQL, politiques RLS, contrôleurs et sécurité).

L'application **Cartographie MDF** est une plateforme Web unifiée et modulaire conçue pour la gestion, la cartographie géographique interactive et l'annuaire synchronisé des membres de l'association **Mbok de France (MDF)**.

L'architecture repose sur une séparation claire des responsabilités entre :
- Le **Frontend Web** (React, TypeScript, Tailwind CSS, Lucide Icons, Leaflet / OpenStreetMap).
- Le **Backend & Services API** (Node.js/Express ou Serverless, PostgreSQL / Firestore, services de géocodage Nominatim/OpenStreetMap).
- Les **Modules Métier** (Authentification RBAC, Annuaire & Cartographie, Zones sur-mesure & Référents, Gestion des Utilisateurs, Import/Export Excel, Maintenance & Qualité, Journaux d'audit).
- La couche **Shared** (Types TypeScript, Constantes, Validateurs de données, Formateurs et Utilitaires).

---

## 2. Structure globale du projet

```text
cartographie-mdf/
│
├── frontend/ (src/)
│   ├── app/                    # Entry point & layout React
│   ├── modules/                # Composants & Vues métier
│   │   ├── dashboard/          # Vue Synthèse & KPIs
│   │   ├── authentification/   # Ecran de connexion RBAC
│   │   ├── annuaire/           # Annuaire dynamique & filtres
│   │   ├── cartographie/       # Carte interactive Leaflet / OpenStreetMap
│   │   ├── membres/            # Modales & fiches détails membres
│   │   ├── zones/              # Gestion des zones géographiques & référents
│   │   ├── utilisateurs/       # Gestion des accès & permissions
│   │   ├── import-export/      # Traitement Excel, parsing & téléversement
│   │   ├── journaux/           # Consultation des logs d'audit
│   │   ├── maintenance/        # Contrôle qualité & dédoublonnage
│   │   └── parametres/         # Réglages association & branding
│   ├── components/             # Composants réutilisables
│   ├── services/               # API clients & géocodage
│   ├── hooks/                  # Custom React hooks
│   └── utils/                  # Utilitaires de conversion & calculs
│
├── shared/ (src/shared/)
│   ├── ui/                     # Primitives UI (Boutons, Modales, Badges)
│   ├── types/                  # Modèles de données TypeScript
│   ├── constants/              # Constantes globales & listes métier
│   ├── validators/             # Règles de validation (Email, Tél, Coordonnées)
│   └── utils/                  # Formateurs de texte & dates
│
├── docs/                       # Spécifications & Documentation
│   ├── ARCHITECTURE.md
│   ├── MVP.md
│   ├── REGLES_METIER.md
│   ├── MAPPING_DONNEES.md
│   ├── DOCUMENTATION_API.md
│   └── UX_UI.md
│
├── infra/                      # Infrastructure & Déploiement
│   ├── docker/                 # Dockerfile & docker-compose
│   ├── nginx/                  # Nginx Reverse Proxy
│   └── deployment/             # Configurations CI/CD
│
└── scripts/                    # Scripts CLI d'administration
    ├── import-excel/           # Script d'importation CLI
    ├── export-excel/           # Script d'exportation CLI
    ├── geocoding/              # Batch geocoder
    └── seed/                   # Données de démonstration
```

---

## 3. Matrice des Rôles et Permissions (RBAC)

| Fonctionnalité / Vue | Administrateur (`admin`) | Référent Régional (`referent`) | Utilisateur (`user`) |
| :--- | :---: | :---: | :---: |
| **Tableau de bord** | Vue globale nationale | Vue restreinte à sa zone | Vue restreinte à sa zone |
| **Annuaire & Carte** | Accès complet, édition/suppression | Accès complet zone assignée | Consultation seule |
| **Zones Géographiques** | Création, édition, assignation référents | Consultation & membres de sa zone | Consultation seule |
| **Utilisateurs & Droits** | Accès complet (Création, Rôles) | Masqué | Masqué |
| **Maintenance & Qualité** | Correction globale & dédoublonnage | Correction membres de sa zone | Masqué |
| **Import / Export Excel** | Import global, Export structuré | Export des membres de sa zone | Masqué |
| **Journaux d'activité** | Consultation globale des logs | Masqué | Masqué |
| **Paramètres Système** | Branding, Nom, Logo, Zoom | Masqué | Masqué |

---

## 4. Principes d'Ingénierie & Sécurité

1. **Isolation du Périmètre Référent** : Les données renvoyées et affichées pour un rôle `referent` sont filtrées côté serveur / contrôleur d'état selon la région ou les zones attribuées.
2. **Dédoublonnage Intelligent** : Algorithme de comparaison d'email et de nom/prénom insensible aux majuscules, accents et espaces superflus.
3. **Géocodage Asynchrone** : Géocodage automatique par adresse / ville / CP via l'API OpenStreetMap Nominatim avec temporisation d'1 seconde par requête (respect de la charte OSM) et fallback sur le chef-lieu de département/région.
4. **Traçabilité Totale** : Chaque action modificatrice (ajout, modification, suppression, réassignation de zone, import Excel) génère une entrée d'audit log détaillée.
