# Fonctionnement de l'Import Intelligent Excel / CSV — Cartographie MDF

## 1. Processus en 5 Étapes

```
[1. Import Fichier] ──> [2. Mapping Colonnes] ──> [3. Nettoyage & Data Quality] ──> [4. Prévisualisation & Rapport] ──> [5. Validation & Base]
```

## 2. Analyse & Mapping Avancé des Colonnes
Le système accepte les en-têtes de colonnes variables et applique un algorithme d'appariement tolérant :
- `Nom` / `Last Name` / `Family Name` ➔ `last_name`
- `Prénom` / `First Name` ➔ `first_name`
- `Mail` / `E-mail` / `Courriel` ➔ `email`
- `Tel` / `Téléphone` / `Mobile` / `Phone` ➔ `telephone`
- `CP` / `Code Postal` / `Zip` ➔ `postal_code`
- `Ville` / `City` ➔ `city`
- `Job` / `Fonction` / `Profession` ➔ `profession`

## 3. Traitements Automatisés
- **Normalisation Téléphone** : Conversion au format international propre (suppression des espaces, parenthèses et points).
- **Détection des Doublons** : Comparaison avec la base existante par adresse e-mail unique.
- **Géocodage Automatique Intégré** : Résolution des latitudes/longitudes en tâche de fond. **Les colonnes Latitude et Longitude ne sont plus nécessaires dans le fichier Excel** : l'application calcule automatiquement l'emplacement exact à partir de la ville, de l'adresse et de la zone.

## 4. Rapport d'Importation & Historique
Après chaque opération, un résumé est enregistré dans la table `import_logs` détaillant :
- Nombre de lignes valides importées avec succès.
- Nombre de doublons mis à jour ou ignorés.
- Liste des erreurs syntaxiques surlignées (ex: ligne 42 email invalide).
