# Rôles et Permissions (RBAC) — Cartographie MDF

## 1. Matrice des Droits d'Accès

| Fonctionnalité / Action | Administrateur (`admin`) | Référent de Zone (`referent`) | Utilisateur / Membre (`user`) |
| :--- | :---: | :---: | :---: |
| **Visualiser l'Annuaire & la Carte** | Global (Toutes les zones) | Strictly Restreint (Sa Zone uniquement) | Restreint (Données publiques) |
| **Consulter Fiche Détaillée Membre** | Tout le réseau | Membres de sa Zone uniquement | Profils publics uniquement |
| **Créer / Modifier un Membre** | Tous les membres | Membres de sa Zone uniquement | Son propre profil uniquement |
| **Supprimer un Membre** | Oui | Non | Non |
| **Gérer les Zones Sur-mesure** | Oui (Création / Suppression / Assignation) | Lecture seule de sa Zone | Non |
| **Affecter des Référents aux Zones** | Oui | Non | Non |
| **Import / Export Massif Excel** | Oui | Non | Non |
| **Consulter les Journaux d'Audit** | Oui | Non | Non |
| **Gestion des Utilisateurs & Rôles** | Oui | Non | Non |
| **Accès aux Paramètres Système** | Oui | Non | Non |

## 2. Isolation des Données par Zone (Référents)
Lorsqu'un utilisateur possède le rôle `referent` (ex: **Modou Mbaye** pour la **Bretagne** ou **Aïssatou Diallo** pour l'**Île-de-France**) :
- L'ensemble de la plateforme (Tableau de Bord, Annuaire & Carte, Zones Géographiques, Filtres) applique un **filtrage hermétique automatique**.
- Le référent **ne voit que les membres et les données rattachés à sa ou ses zone(s) attribuée(s)** (`assignedZoneIds` ou `referentUserId`).
- Dans l'espace **Zones Géographiques**, seules les cartes correspondant à sa ou ses zones attribuées sont affichées (ex: un référent Bretagne ne voit que la carte Bretagne, à l'exclusion des autres régions).
- Les zones et membres appartenant à d'autres régions ou groupes lui sont totalement inaccessibles pour garantir la confidentialité et la sectorisation territoriale.

## 3. Sécurité de Navigation & Réinitialisation des Onglets
- **Guard d'accès aux Onglets** : Seuls les administrateurs ont accès aux onglets réservés (`users`, `quality`, `import_export`, `audit_logs`, `settings`). Si un utilisateur non-admin tente d'accéder à l'un de ces onglets, l'application le redirige immédiatement vers l'onglet principal (`directory`).
- **Déconnexion et Changement de Session** : Lors de la déconnexion d'un utilisateur ou du basculement vers un compte Référent/Utilisateur, l'onglet actif est automatiquement réinitialisé vers l'Annuaire & Carte (`directory`). Cela empêche un utilisateur sans privilèges élevés d'hériter de l'onglet d'administration précédemment consulté par un Administrateur.

## 4. Synchronisation Automatique des Utilisateurs Référents
- **Membre de Zone Automatique** : Tout utilisateur créé ou désigné avec le rôle `referent` est automatiquement intégré comme membre officiel de l'annuaire rattaché à sa région/zone d'attribution s'il n'y figurait pas encore.
- **Désignation du Responsable** : La fiche de la zone est instantanément mise à jour avec l'identifiant et le nom complet du référent assigné (`referentUserId` et `referentName`).
- **Maintien de la Cohérence lors des Suppressions** : La suppression d'un membre entraîne automatiquement son retrait de toutes les listes de membres (`memberIds`) des zones sur-mesure.
