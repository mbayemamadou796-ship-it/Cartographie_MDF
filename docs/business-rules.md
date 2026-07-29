# Règles Métier (Business Rules) — Cartographie MDF

## 1. Règle de Géolocalisation & Coordonnées GPS
- Chaque membre saisi avec une adresse et un code postal valides subit un géocodage automatique pour obtenir sa `latitude` et `longitude`.
- Si le géocodage échoue ou si l'adresse est imprécise, le membre reste affiché dans la liste mais reçoit le statut "Coordonnées à vérifier".

## 2. Règle de Calcul de Qualité des Données (Health Score)
Le score de complétion d'un profil (sur 100 points) est calculé selon les pondérations suivantes :
- **Adresse GPS valide et géocodée** : 40 points
- **Téléphone valide (format vérifié)** : 30 points
- **Adresse email valide** : 30 points

## 3. Règle d'Attribution Automatique des Zones
- Lors de la création ou de la mise à jour d'un membre, si sa `custom_zone_id` n'est pas spécifiée manuellement, le système l'associe automatiquement à la zone géographique dont le département ou le code région correspond au code postal du membre.

## 4. Règle de Confidentialité et Protection des Données (RGPD)
- Les visiteurs et utilisateurs simples non authentifiés voient la ville et la profession des membres mais ne peuvent pas consulter directement leur numéro de téléphone ou leur adresse exacte.
- Seuls les administrateurs et le référent de la zone ont accès aux coordonnées complètes du membre.

## 5. Règle d'Alerte de Déménagement
- En cas de modification du code postal ou de la ville d'un membre, une alerte "Changement de zone" est émise pour informer les référents des zones de départ et d'arrivée.
