# Mise à jour – Amélioration du module Journaux d'activité & Audit

## Objectif

Afin d'améliorer la traçabilité des actions réalisées dans l'application Cartographie MDF, le module **Journaux d'activité & Audit** sera enrichi avec des informations temporelles complètes.

L'objectif est de permettre aux administrateurs de savoir précisément :

- Qui a réalisé une action ;
- Quelle action a été réalisée ;
- Sur quel élément ;
- À quelle date ;
- À quelle heure ;
- Avec quels détails.

Cette évolution facilitera le suivi des opérations, la recherche d'informations et les éventuels audits.

---

# Nouvelle structure du tableau des journaux

Le tableau des journaux sera composé des colonnes suivantes :

| Colonne                    | Description                                                            |
| -------------------------- | ---------------------------------------------------------------------- |
| Date                       | Date complète de l'action (JJ/MM/AAAA)                                 |
| Heure                      | Heure exacte (HH:MM:SS)                                                |
| Utilisateur                | Nom de l'utilisateur ayant réalisé l'action                            |
| Rôle                       | Administrateur, Référent ou Lecteur                                    |
| Catégorie                  | Membres, Zones, Utilisateurs, Connexions, Import/Export, Paramètres... |
| Action réalisée            | Création, Modification, Suppression, Connexion, Déconnexion...         |
| Élément concerné           | Nom du membre, de la zone ou de l'utilisateur concerné                 |
| Détails de la modification | Description précise de l'action réalisée                               |

---

# Exemple d'affichage

| Date       | Heure    | Utilisateur | Rôle           | Catégorie  | Action       | Élément      | Détails                     |
| ---------- | -------- | ----------- | -------------- | ---------- | ------------ | ------------ | --------------------------- |
| 31/07/2026 | 14:32:18 | Bilal       | Administrateur | Connexions | Connexion    | -            | Ouverture de session        |
| 31/07/2026 | 14:35:47 | Bilal       | Administrateur | Membres    | Modification | Jean Dupont  | Numéro de téléphone modifié |
| 31/07/2026 | 15:10:52 | Fatou       | Référent       | Membres    | Ajout        | Marie Martin | Nouveau membre ajouté       |
| 31/07/2026 | 16:02:15 | Bilal       | Administrateur | Zones      | Modification | Bretagne     | Référent de la zone modifié |

---

# Horodatage

Chaque journal devra enregistrer automatiquement :

- La date complète ;
- L'heure précise ;
- Le fuseau horaire utilisé (Europe/Paris).

Exemple :

```text
31/07/2026
14:32:18
Europe/Paris
```

L'horodatage sera généré automatiquement par le serveur afin de garantir son exactitude.

---

# Temps relatif (amélioration UX)

En complément de la date et de l'heure, l'application pourra afficher un temps relatif afin de faciliter la lecture.

Exemple :

```text
31/07/2026 à 14:32:18

Il y a 2 minutes
```

ou

```text
30/07/2026 à 09:15:42

Il y a 1 jour
```

Cette information est uniquement destinée à améliorer l'expérience utilisateur.

---

# Recherche

La barre de recherche devra permettre de rechercher un journal par :

- Nom d'utilisateur ;
- Nom d'un membre ;
- Nom d'une zone ;
- Action réalisée ;
- Catégorie.

---

# Nouveaux filtres

Le module Journaux proposera des filtres permettant de retrouver rapidement une action.

## Filtre par date

- Aujourd'hui
- Hier
- Cette semaine
- Ce mois
- Période personnalisée

---

## Filtre par utilisateur

- Administrateur
- Référent
- Lecteur

ou directement par nom.

---

## Filtre par catégorie

- Membres
- Zones
- Utilisateurs
- Connexions
- Import / Export
- Paramètres

---

## Filtre par action

- Ajout
- Modification
- Suppression
- Connexion
- Déconnexion
- Import
- Export

---

## Filtre par zone

Permet d'afficher uniquement les actions concernant une zone MDF spécifique.

Exemple :

- Bretagne
- Île-de-France
- Occitanie
- Nouvelle-Aquitaine

---

# Informations enregistrées pour chaque journal

Chaque entrée du journal devra contenir au minimum :

- Identifiant du journal ;
- Date ;
- Heure ;
- Utilisateur ;
- Rôle ;
- Zone concernée (si applicable) ;
- Catégorie ;
- Action réalisée ;
- Élément concerné ;
- Détails de la modification.

---

# Export des journaux

L'administrateur pourra exporter les journaux :

- Excel (.xlsx)
- CSV
- PDF (évolution future)

Les filtres appliqués devront être conservés lors de l'export.

---

# Conservation des journaux

Les journaux ne devront jamais être supprimés automatiquement.

Ils constituent l'historique officiel des actions réalisées dans l'application.

Seul un administrateur pourra consulter cette section.

---

# Objectifs de cette évolution

Cette amélioration permettra :

- Une traçabilité complète des actions réalisées.
- Une meilleure supervision des administrateurs.
- Une recherche rapide d'un événement précis.
- Un historique fiable des modifications.
- Une gestion plus sécurisée de l'application.
- Une conformité avec les bonnes pratiques des applications professionnelles de gestion et d'audit.
