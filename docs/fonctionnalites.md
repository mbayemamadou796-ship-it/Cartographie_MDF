# Description Détallée des Fonctionnalités — Cartographie MDF

> ⛔ **DIRECTIVE GÉNÉRALE** : Le Frontend (design, organisation des éléments, layout UI/UX, composants visuels) est **intégralement finalisé et stabilisé — NE PAS Y TOUCHER**. Les évolutions à venir doivent se concentrer exclusivement sur la couche **Backend** (API REST, base de données, Supabase/PostgreSQL, RLS et sécurité).

## 1. Carte Interactive & Géolocalisation
- **Affichage sur Carte** : Représentation visuelle des membres par marqueurs et regroupements (clusters).
- **Géocodage Intelligemment Synchronisé** : Calcul et synchronisation automatique des coordonnées GPS (latitude et longitude) pour chaque membre selon sa ville de résidence et sa zone régionale.
- **Filtres Carte** : Filtrage en temps réel par zone régionale (Bretagne, Île-de-France, Pays de la Loire...), ville/commune, ou secteur d'activité.
- **Fiche Popup Membre** : Clic sur un marqueur pour afficher la ville de résidence et l'essentiel du profil avec accès direct à la fiche détaillée.

## 2. Annuaire Dynamique
- **Recherche Multi-critères** : Recherche textuelle instantanée (Nom, Prénom, Profession, Entreprise, Ville de résidence).
- **Champs Précis Membre** : Saisie obligatoire de la ville de résidence (ex: Rennes, Nantes, Lyon, Saint-Denis) pour chaque membre au sein de sa zone attribuée.
- **Filtres Avancés** :
  - Domaine d'étude (Informatique, Droit, Santé, Commerce...)
  - Situation professionnelle (Salarié, Étudiant, Indépendant, Cadre...)
  - Statut de complétion du profil.
- **Modes d'Affichage** : Bascule entre vue Grille de cartes, vue Liste compacte et vue Carte.

## 3. Gestion des Zones Géographiques (Régions Administratives de France)
- Découpage territorial aligné sur les vraies régions françaises (Bretagne, Île-de-France, Pays de la Loire, Normandie, Auvergne-Rhône-Alpes, Nouvelle-Aquitaine, Occitanie, PACA, Hauts-de-France, Grand Est, Bourgogne-Franche-Comté, Centre-Val de Loire, Corse, Outre-Mer).
- **Indicateurs Épurés & Interactifs sur le Tableau de Bord et l'Espace Zones** :
  - **Consultation Interactive par Clic** : Un clic sur les cartes d'indicateurs (Villes Représentées, Départements Couverts, Zones Régionales, Membres Associés) ouvre une fenêtre modale détaillée (`StatDetailModal`).
  - **Détails & Filtres Cartographiques** : Exploration des listes groupées par ville ou département avec recherche en temps réel, accès direct aux fiches membres et bouton pour afficher/filtrer la commune ou le département sélectionné sur la carte interactive.
- Attribution d'un ou plusieurs **Référents de Zone** (ex: Modou Mbaye pour la zone Bretagne).
- Visualisation des effectifs et des membres rattachés à chaque commune de la zone.

## 4. Import Intelligent Excel / CSV
- Import en glisser-déposer de listes Excel (`.xlsx`, `.csv`).
- Mapping automatique des colonnes personnalisées vers le schéma de données.
- Rapport d'analyse préalable (doublons, coordonnées manquantes, numéros invalides).
- Intégration en base avec journalisation de l'opération.

## 5. Audit, Journaux & Sécurité
- Suivi de toutes les opérations d'édition/suppression effectuées par les Administrateurs et Référents.
- Historique filtrable par catégorie (Membres, Zones, Utilisateurs, Imports, Sécurité).
