# Rôles et Permissions (RBAC) — Cartographie MDF

## 1. Matrice des Droits d'Accès

| Fonctionnalité / Action | Administrateur (`admin`) | Référent Régional (`referent`) | Utilisateur / Membre (`user`) |
| :--- | :---: | :---: | :---: |
| **Visualiser l'Annuaire & la Carte** | Full (Global) | Full (Global) | Restreint (Données publiques) |
| **Consulter Fiche Détaillée Membre** | Tout le réseau | Membres de sa Zone | Profils publics uniquement |
| **Créer / Modifier un Membre** | Tous les membres | Membres de sa Zone uniquement | Son propre profil uniquement |
| **Supprimer un Membre** | Oui | Non | Non |
| **Gérer les Zones Géographiques** | Oui | Lecture seule | Non |
| **Affecter des Référents aux Zones** | Oui | Non | Non |
| **Import / Export Massif Excel** | Oui | Non | Non |
| **Consulter les Journaux d'Audit** | Oui | Activité de sa zone | Non |
| **Gestion des Utilisateurs & Rôles** | Oui | Non | Non |
| **Accès aux Paramètres Système** | Oui | Non | Non |

## 2. Isolation des Données par Zone (Référents)
Lorsqu'un utilisateur possède le rôle `referent`, les API et composants d'édition appliquent un filtre automatique limitant les droits de modification aux seuls membres dont la zone ou le département correspond à la zone attribuée au référent.
