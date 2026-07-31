# Architecture Technique — Cartographie MDF

## 1. Structure du Projet (Monorepo Modulaire)

```
/
├── frontend/
│   └── web-cartographie/
│       └── src/               # Application React + Vite (UI, Cartographie, Modules)
├── backend/                   # Service API Node.js / Express (Routes, Services, Controllers)
├── shared/                    # Code partagé entre Frontend et Backend
│   ├── types/                 # Interfaces et Enums TypeScript canoniques
│   ├── constants/             # Libellés, métadonnées et configurations partagées
│   └── validators/            # Fonctions de validation (Email, Téléphone, Qualité)
├── docs/                      # Documentation complète du projet
└── infra/                     # Scripts de déploiement et configuration d'infrastructure
```

## 2. Stack Technique
- **Frontend** : React 18, Vite, TypeScript, Tailwind CSS, Leaflet / React-Leaflet, Lucide Icons, Motion.
- **Backend** : Node.js, Express, TypeScript (transpilation esbuild / tsx).
- **Base de Données** : Supabase / PostgreSQL (Support de géolocalisation et clés étrangères).
- **Outils de Build** : Vite, tsc, esbuild.

## 3. Flux de Données & Communication
- L'application Web Frontend effectue des requêtes REST vers l'API Backend sur `/api/*`.
- Les types TypeScript partagés dans `/shared/types` garantissent un contrat d'interface strict et sans ambiguïté entre le Frontend et le Backend.
