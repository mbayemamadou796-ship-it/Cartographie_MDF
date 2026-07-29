# Cartographie & Annuaire Interactif — Mbok de France (MDF)

Plateforme web unifiée de cartographie interactive, d'annuaire synchronisé, de découpage territorial par zones et de suivi de la qualité des données pour l'association **Mbok de France (MDF)**.

---

## 🏗️ Architecture Globale du Projet

Le projet adopte une **architecture modulaire découplée**, organisée comme suit :

```text
cartographie-mdf/

├── frontend/
│   └── web-cartographie/
│       └── src/
│           ├── app/                   # Composant racine & layout
│           ├── modules/               # Modules fonctionnels découplés
│           │   ├── dashboard/         # Synthèse & indicateurs clés
│           │   ├── authentification/  # Écran de connexion RBAC
│           │   ├── annuaire/          # Liste dynamique & filtres
│           │   ├── cartographie/      # Carte Leaflet / OpenStreetMap
│           │   ├── membres/           # Fiches membres & formulaires
│           │   ├── zones/             # Découpage territorial & référents
│           │   ├── utilisateurs/      # Administration des accès
│           │   ├── import-export/     # Import / Export Excel
│           │   ├── journaux/          # Audit logs & traçabilité
│           │   ├── maintenance/       # Contrôle qualité & dédoublonnage
│           │   └── parametres/        # Branding & préférences
│           ├── components/            # Composants transversaux
│           ├── services/              # Client API & géocodage
│           ├── hooks/                 # Custom React hooks
│           ├── types/                 # Types TypeScript
│           └── utils/                 # Utilitaires (Excel, Geocoding)
│
├── backend/                           # Architecture Backend & API REST
│   ├── api/                           # Serveur & routes API
│   ├── auth/                          # Contrôleur d'authentification RBAC
│   ├── database/                      # Modèles BDD & scripts de seed
│   ├── modules/                       # Services métier
│   │   ├── membres/
│   │   ├── zones/
│   │   ├── utilisateurs/
│   │   ├── cartographie/
│   │   ├── import-export/
│   │   ├── journaux/
│   │   ├── maintenance/
│   │   └── statistiques/
│   ├── storage/                       # Fichiers temporaires & téléversements
│   ├── logs/                          # Fichiers de logs système
│   └── utils/                         # Logger & utilitaires backend
│
├── shared/                            # Ressources partagées (Frontend / Backend)
│   ├── ui/                            # Primitives UI (Button, Badge, Modal)
│   ├── types/                         # Modèles TypeScript globaux
│   ├── constants/                     # Constantes métier MDF
│   ├── validators/                    # Validateurs (Email, Téléphone, GPS)
│   └── utils/                         # Formateurs de dates & texte
│
├── docs/                              # Spécifications & Documentation
│   ├── ARCHITECTURE.md                # Description de l'architecture
│   ├── MVP.md                         # Périmètre fonctionnel MVP
│   ├── REGLES_METIER.md               # Règles métier & calculs RBAC
│   ├── MAPPING_DONNEES.md             # Dictionnaire des champs & imports
│   ├── DOCUMENTATION_API.md           # Endpoints API REST
│   └── UX_UI.md                       # Directives charte graphique & design
│
├── infra/                             # Configurations Infrastructure & Déploiement
│   ├── docker/                        # Dockerfile & Docker Compose
│   ├── nginx/                         # Proxy Nginx
│   ├── github/                        # Workflows GitHub Actions (CI/CD)
│   └── deployment/                    # Scripts de déploiement Cloud
│
├── scripts/                           # Scripts CLI d'administration
│   ├── import-excel/                  # Ingestion CLI Excel
│   ├── export-excel/                  # Generation CLI Excel
│   ├── geocoding/                     # Batch geocoder OpenStreetMap
│   ├── backup/                        # Sauvegarde BDD
│   └── seed/                          # Population de données de test
│
└── README.md
```

---

## 🔑 Rôles et Permissions (RBAC)

1. **Administrateur MDF (`admin`)** :
   - Accès global à l'ensemble du territoire national et international.
   - Gestion complète des membres, zones sur-mesure, utilisateurs, imports/exports Excel, contrôle qualité, journaux d'audit et paramètres d'association.

2. **Référent de Zone (`referent`)** :
   - Périmètre **strictement et automatiquement restreint** aux membres et zones qui lui sont attribués (ex: Modou Mbaye pour la zone Bretagne, Aïssatou Diallo pour l'Île-de-France).
   - Accès restreint uniquement à sa zone sur le Tableau de bord, l'Annuaire & Carte, et l'onglet Zones Géographiques.
   - Les autres zones et membres hors de sa région lui sont totalement inaccessibles.

3. **Utilisateur / Membre (`user`)** :
   - Consultation seule de l'annuaire et de la carte communautaire.

---

## 👤 Comptes de Démonstration

| Identifiant | Mot de passe | Rôle | Zone / Portée | Nom |
| :--- | :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | Administrateur | Global (Toutes les zones) | Administrateur MDF |
| **`modou`** | `modou123` | Référent | **Bretagne** uniquement | Modou Mbaye |
| **`referent`** | `referent123` | Référent | **Île-de-France** uniquement | Aïssatou Diallo |
| **`membre`** | `user123` | Membre | Mode lecture | Mamadou Sow |

---

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
npm install

# Lancement en mode développement (Port 3000)
npm run dev

# Vérification du typage
npm run lint

# Build de production
npm run build
```

---

## 🎨 Charte & Identité Mbok de France

- **Couleurs Signature** : Vert Émeraude (`#2be39d` / `#10B981`) & Slate profond.
- **Typographie** : `Outfit` (Titres) & `Plus Jakarta Sans` (Interface & Formulaires).
