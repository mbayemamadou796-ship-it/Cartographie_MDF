# Règles Métier — Cartographie MDF

## 1. Gestion des Utilisateurs et Droits (RBAC)

### Règle RBAC-01 : Hiérarchie des Rôles
- **Administrateur** (`admin`) : Possède tous les droits de lecture, écriture, suppression, import/export, administration des utilisateurs et modification des paramètres de l'association.
- **Référent** (`referent`) : Ne voit que les membres rattachés à sa zone ou à sa région d'attribution. Il peut ajouter/éditer des membres de sa zone et exporter la liste de sa zone.
- **Utilisateur** (`user`) : Mode consultation uniquement sur l'annuaire et la carte interactive. Impossible d'accéder aux vues de maintenance, d'importation, d'utilisateurs ou de paramètres.

---

## 2. Portée des Données pour les Référents

### Règle SCOPE-01 : Filtrage des Membres par Zone
Un membre $M$ est visible par le référent $R$ si :
1. $M$ fait partie de la liste `memberIds` d'une zone dont $R$ est le `referentUserId` ou attribué via `assignedZoneIds`.
2. $M.region$ ou $M.zone$ correspond au nom de la zone/région attribuée à $R$.

---

## 3. Qualité et Intégrité des Données

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
