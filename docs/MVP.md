# Périmètre du Minimum Viable Product (MVP) — Cartographie MDF

## 1. Objectif du MVP

Le MVP de l'application **Cartographie MDF** fournit une solution complète d'annuaire géographique et de suivi des membres de l'association Mbok de France. Il garantit la fiabilité des données, la visualisation cartographique en temps réel et la gestion sécurisée par rôles.

---

## 2. Fonctionnalités Clés Incluses dans le MVP

### 🔑 1. Authentification & Rôles (RBAC)
- Écran de connexion unifié avec gestion des sessions.
- Support de 3 rôles distincts :
  - **Administrateur MDF** : Accès intégral à toutes les fonctionnalités et paramètres.
  - **Référent Régional** : Gestion et suivi restreints à la zone/région assignée (ex: Île-de-France).
  - **Utilisateur / Membre** : Consultation de l'annuaire et de la carte communautaire.

### 🗺️ 2. Annuaire & Carte Interactive Synchronisés
- Carte interactive **Leaflet / OpenStreetMap** avec clusters dynamiques et marqueurs personnalisés.
- Barre de recherche multi-champs instantanée (recherche simultanée sur nom, prénom, ville, département, fonction, organisation, domaine d'étude).
- Filtres combinables : Ville, Département, Région, Zone sur-mesure, Situation professionnelle, Domaine d'étude, Année d'arrivée en France.
- Fiches membres complètes avec coordonnées, photo, historique d'adresse et champs personnalisés.

### 🌐 3. Zones Géographiques & Référents
- Découpage territorial personnalisé (ex: *Bretagne*, *Île-de-France*, *Grand Ouest*, *Réseau Sud*).
- Assignation d'un membre Référent à chaque zone.
- Modal de gestion des membres par zone avec ajout/retrait rapide.

### 🛠️ 4. Maintenance & Qualité des Données
- Indicateurs de qualité en temps réel :
  - Téléphones manquants
  - Emails manquants
  - Coordonnées GPS non géocodées
  - Doublons potentiels (détection automatique par email/nom)
- Outils de correction en 1 clic et dédoublonnage fusionné.

### 📊 5. Importation & Exportation Excel
- Importation de fichiers `.xlsx` / `.xls` / `.csv` avec prévisualisation et rapport d'anomalies.
- Géocodage automatique à l'importation.
- Exportation ciblée des membres filtrés au format Excel structuré.

### 📋 6. Journaux d'Audit & Paramètres
- Historique exhaustif des actions (connexions, ajouts, modifications, réassignations, exports).
- Personnalisation du nom de l'association, du slogan, du logo et du centrage initial de la carte.
