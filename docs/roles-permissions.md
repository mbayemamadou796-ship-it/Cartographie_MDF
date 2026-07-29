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
- Les zones et membres appartenant à d'autres régions ou groupes lui sont totalement inaccessibles pour garantir la confidentialité et la sectorisation territoriale.
