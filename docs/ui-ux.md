# Organisation des Écrans et Guide Navigation UI/UX — Cartographie MDF

> 🔒 **STATUT DU FRONTEND** : L'organisation des écrans, le design, le layout UI/UX et la structure des composants décrits ci-dessous sont **définitivement stabilisés et validés**. **IL NE FAUT PLUS TOUCHER NI MODIFIER LE FRONTEND**. L'ensemble des travaux de développement à venir doit se concentrer exclusivement sur la couche **Backend**.

## 1. Structure Générale du Dashboard
L'interface s'articule autour d'un système à deux composantes principales :
1. **Sidebar Latérale Navigation** :
   - Dashboard & Résumé
   - Carte Interactive
   - Annuaire des Membres
   - Zones Géographiques
   - Qualité & Maintenance
   - Import / Export Excel
   - Journaux d'Audit (Admin)
   - Paramètres (Admin)
2. **Barre de Navigation Supérieure (Header)** :
   - Recherche globale instantanée
   - Indicateur de Rôle Actif (Basculeur démo Admin / Référent / Membre)
   - Notifications et état de la base

## 2. Parcours UX Principaux

### Parcours A : Exploration par la Carte
`Sidebar ➔ Cartographie` : L'utilisateur navigue sur la carte de France/Monde, clique sur un regroupement régional, affine par domaine d'étude et sélectionne un membre pour afficher son profil.

### Parcours B : Importation d'une nouvelle Liste Excel
`Sidebar ➔ Import / Export` : L'administrateur dépose le fichier Excel, vérifie le pré-mapping automatique des colonnes, consulte le rapport de nettoyage des erreurs, puis valide l'intégration en base.

### Parcours C : Gestion d'une Zone par un Référent
`Sidebar ➔ Zones Géographiques` : Le référent accède à sa zone d'attribution, consulte la liste des membres associés, valide les données et met à jour les informations en cas de besoin.

### Parcours D : Inspection Interactive des Métriques (Villes, Départements, Membres)
`Dashboard ou Zones ➔ Clic sur Métrique (ex: Villes ou Départements)` : Une fenêtre modale interactive (`StatDetailModal`) s'ouvre, permettant de filtrer les villes/départements, de déplier la liste des membres rattachés et de basculer la carte directement sur la zone sélectionnée.
