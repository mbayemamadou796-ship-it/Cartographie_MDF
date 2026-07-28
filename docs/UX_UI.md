# Directives UX/UI — Cartographie MDF

## 1. Principes de Design

L'interface de l'application **Cartographie MDF** est conçue pour allier lisibilité, sobriété institutionnelle et clarté opérationnelle.

---

## 2. Palette de Couleurs Identitaire

- **Couleur Principale MDF** : Vert Émeraude (`#2be39d` à `#48c92a` et `#8de02d` - Dégradé signature Mbok).
- **Arrière-plans** : Blanc pur (`#FFFFFF`) et Slate très doux (`#F8FAFC`).
- **Textes** : Slate sombre (`#0F172A` pour le titre principal, `#334155` pour le corps).
- **Badges et Alertes** :
  - Qualité / Avertissement : Amber (`#F59E0B`).
  - Validation / Succès : Emerald (`#10B981`).
  - Erreurs / Suppression : Rose / Red (`#F43F5E`).

---

## 3. Typographie

- **Titres & Identité** : `Outfit`, sans-serif (structure moderne et élégante).
- **Corps de texte & Formulaires** : `Plus Jakarta Sans` ou sans-serif système (haute lisibilité sur tous les écrans).

---

## 4. Composants Clés

1. **Header Réactif** : Présente l'identité Mbok de France, la barre de recherche globale rapide, l'indicateur du rôle actif et le bouton de profil / déconnexion.
2. **Navigation Onglets Réactive** : S'adapte au rôle de l'utilisateur (`admin`, `referent`, `user`).
3. **Carte Interactive Leaflet** :
   - Fond de carte clair et lisible (CartoDB Positron / OpenStreetMap).
   - Marqueurs colorés avec popups d'information instantanés.
   - Contrôles de zoom et centrage automatique.
