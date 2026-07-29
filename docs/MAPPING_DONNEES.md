# Mapping des Données — Cartographie MDF

## 1. Modèle Membre (`Member`)

| Champ TypeScript | Type | Obligatoire | Alias Import Excel | Description |
| :--- | :--- | :---: | :--- | :--- |
| `id` | `string` | Oui | ID, Identifiant | Identifiant unique du membre (ex: `mdf-001`) |
| `nom` | `string` | Oui | Nom, NOM, Last Name | Nom de famille |
| `prenom` | `string` | Oui | Prénom, Prenom, First Name | Prénom |
| `telephone` | `string` | Non | Téléphone, Tel, Phone, Mobile | Numéro de téléphone au format international |
| `email` | `string` | Non | E-mail, Email, Courriel | Adresse email unique |
| `zone` | `string` | Oui | Zone, Région, Territoire | Zone géographique régionale (ex: Bretagne, Île-de-France, Pays de la Loire...) |
| `situationProfessionnelle` | `string` | Non | Situation, Statut pro, Profession | Ex: Salarié, Étudiant, Indépendant, Cadre |
| `domaineEtude` | `string` | Non | Domaine, Secteur, Domaine d'étude | Ex: Informatique, Droit, Commerce, Santé |
| `anneeArriveeFrance` | `string` | Non | Arrivée France, Année arrivée | Année d'installation en France (ex: 2018) |
| `fonction` | `string` | Non | Fonction, Poste, Titre | Intitulé exact du poste |
| `organisation` | `string` | Non | Organisation, Entreprise, École | Structure ou entreprise d'affiliation |
| `adresse` | `string` | Non | Adresse, Rue, Voie | Adresse postale résiduelle |
| `codePostal` | `string` | Non | CP, Code Postal, Zip | Code postal |
| `ville` | `string` | Oui | Ville, Commune, City | Ville de résidence précise du membre dans la zone |
| `departement` | `string` | Non | Dép, Département, Dept | Nom ou numéro du département |
| `region` | `string` | Non | Région, Region | Région administrative (synonyme de Zone) |
| `pays` | `string` | Non | Pays, Country | Pays de résidence (Défaut: France) |
| `latitude` | `number` | Calculé (Auto) | Lat, Latitude | Coordonnée géographique nord (générée automatiquement via Ville/Zone) |
| `longitude` | `number` | Calculé (Auto) | Lng, Longitude, Lon | Coordonnée géographique est (générée automatiquement via Ville/Zone) |
| `photo` | `string` | Non | Photo, Avatar, Image URL | URL ou base64 de la photo de profil |
| `champsPersonnalises` | `CustomField[]` | Non | - | Tableau de métadonnées additionnelles `{ id, label, value }` |

---

## 2. Modèle Utilisateur App (`AppUser`)

| Champ TypeScript | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Identifiant utilisateur (`usr-admin`, `usr-referent-idf`) |
| `nom` | `string` | Nom de famille |
| `prenom` | `string` | Prénom |
| `name` | `string` | Nom complet affiché |
| `email` | `string` | Email professionnel |
| `username` | `string` | Identifiant de connexion |
| `password` | `string` | Mot de passe (haché en prod) |
| `role` | `'admin' \| 'referent' \| 'user'` | Rôle d'accès système |
| `region` | `string` | Région d'attribution si rôle `referent` |
| `assignedZoneIds` | `string[]` | Identifiants des zones gérées |
| `active` | `boolean` | Statut du compte (actif/suspendu) |
| `lastLogin` | `string` | Horodatage de dernière connexion |

---

## 3. Modèle Zone Sur-mesure (`CustomZone`)

| Champ TypeScript | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Identifiant unique de la zone (ex: `zone-bretagne`) |
| `name` | `string` | Intitulé de la zone |
| `description` | `string` | Description fonctionnelle |
| `color` | `string` | Thème couleur pour la carte (`emerald`, `blue`, `indigo`, `amber`) |
| `memberIds` | `string[]` | Liste des IDs membres assignés |
| `referentUserId` | `string` | ID de l'utilisateur Référent responsable |
| `createdAt` | `string` | Date de création |
