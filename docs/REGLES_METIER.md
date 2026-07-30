# Règles Métier — Cartographie MDF

## 1. Gestion des Utilisateurs et Droits (RBAC)

### Règle RBAC-01 : Hiérarchie des Rôles
- **Administrateur** (`admin`) : Possède tous les droits de lecture, écriture, suppression, import/export, administration des utilisateurs et modification des paramètres de l'association.
- **Référent** (`referent`) : Ne voit que les membres et la/les zone(s) rattachés à sa région d'attribution. Il peut ajouter/éditer des membres de sa zone et exporter la liste de sa zone.
- **Utilisateur** (`user`) : Mode consultation uniquement sur l'annuaire et la carte interactive. Impossible d'accéder aux vues de maintenance, d'importation, d'utilisateurs ou de paramètres.

### Règle RBAC-02 : Réinitialisation Sécurisée de Navigation
- Lors d'une déconnexion ou d'une reconnexion sous une identité non-administrateur (ex: Référent ou Utilisateur), l'onglet actif est systématiquement réinitialisé vers l'Annuaire (`directory`). Cela garantit que les vues d'administration précédemment ouvertes ne restent jamais accessibles par un utilisateur non autorisé.

### Règle RBAC-03 : Compte Administrateur Racine Unique & Création des Comptes
- **Administrateur Initial Unique** : Lors de l'initialisation du système / de la base de données, **un seul et unique compte administrateur** est créé par défaut :
  - **Identifiant** : `Bilal`
  - **Mot de passe** : `Ziguinchor1999@`
  - **Rôle** : `admin`
- **Délégation de Création des Utilisateurs** : L'administrateur initial (`Bilal`) est la seule personne habilitée au départ à créer les comptes ultérieurs. C'est à lui d'enregistrer et d'attribuer les rôles aux autres utilisateurs (Administrateurs, Référents de zone, Utilisateurs en lecture seule).


---

## 2. Portée des Données pour les Référents

### Règle SCOPE-01 : Filtrage des Membres et des Zones
Un membre $M$ ou une zone $Z$ est visible par le référent $R$ si :
1. $Z$ est la zone dont $R$ est le `referentUserId` ou attribué via `assignedZoneIds`.
2. $M$ fait partie de la liste `memberIds` d'une zone attribuée à $R$, ou $M.region$ correspond au nom de la zone/région attribuée à $R$.
3. Dans l'espace Zones Géographiques, seules les cartes de la ou des zone(s) de $R$ sont affichées.

---

## 3. Synchronisation Automatique et Cohérence Inter-Modules

### Règle SYNC-01 : Intégration Automatique des Référents
- Lorsqu'un compte utilisateur avec le rôle `referent` est créé ou modifié, le système l'associe automatiquement comme **Membre** de la zone/région attribuée et met à jour la désignation du responsable de la zone (`referentUserId`, `referentName`).

### Règle SYNC-02 : Maintien de l'Intégrité Référentielle
- Lors du changement de région ou de zone d'un membre dans l'annuaire, son affiliation dans la liste `memberIds` des zones est automatiquement mise à jour.
- Lors de la suppression d'un membre dans l'annuaire, ses références sont immédiatement nettoyées de l'ensemble des zones sur-mesure.

---

## 4. Qualité et Intégrité des Données

### Règle QUAL-01 : Détection des Doublons
Deux membres $M_1$ et $M_2$ sont considérés comme doublons potentiels si :
- $M_1.email \text{ (normalisé)} == M_2.email \text{ (normalisé)}$
- OU $(M_1.nom + M_1.prenom) \text{ (normalisés)} == (M_2.nom + M_2.prenom) \text{ (normalisés)}$

### Règle QUAL-02 : Géocodage Automatique et Synchronisation GPS
L'application prend en charge la résolution automatique des coordonnées géographiques (latitude et longitude) :
1. **Pendant la saisie / édition** : À partir des champs `adresse`, `codePostal`, `ville` et `zone` (ex: Bretagne, Île-de-France), l'application interroge l'API Nominatim/OpenStreetMap ou bascule automatiquement sur le dictionnaire de coordonnées intégré pour positionner le membre sur la carte.
2. **Lors de l'importation Excel** : Les colonnes latitude et longitude ne sont pas requises dans les fichiers Excel. L'application calcule automatiquement les coordonnées GPS de chaque membre importé en s'appuyant sur sa ville et sa zone.
3. **Fallback Téléchargé / Hors Ligne** : Si l'adresse exacte est introuvable, les coordonnées sont automatiquement calées sur le centre de la commune (`ville`) ou sur le chef-lieu de la `zone` administrative attribuée.

---

## 4. Notifications de Changement de Localisation

### Règle LOC-01 : Alertes de Déménagement
Lors de la modification de la ville ou région d'un membre rattaché à une zone sur-mesure, le système génère une alerte invitant le gestionnaire à :
- Conserver le membre dans sa zone actuelle,
- Transférer le membre vers la zone correspondant à sa nouvelle localisation,
- Retirer le membre de la zone.
