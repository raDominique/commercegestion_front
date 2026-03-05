# Composants & Contexts

Composants clés

- `src/components/Layout/` — `Header`, `Footer`, `Sidebar`, `Layout` : structure globale de l'UI.
- `src/components/ProtectedRoute.jsx` — wrapper pour routes nécessitant authentification.
- `src/components/commons/` — petites utilités : `CartSheet.jsx`, `ImageWithFallback.jsx`, `UserNotValidatedBanner.jsx`.
- `src/components/ui/` — primitives UI (boutons, formulaires, tables, modals, select, input, avatar, badge, tooltip, etc.). Ces composants servent de base pour construire l'UI des pages.

Contextes

- `src/context/AuthContext.jsx` — gère l'état de l'utilisateur connecté, login/logout et persistance du token.
- `src/context/CartContext.jsx` — gère les actions et l'état du panier.

Carte & géolocalisation

- `GoogleMapPicker.jsx` / `LeafletMapPicker.jsx` — composants utilitaires pour sélectionner des positions sur la carte.

Bonnes pratiques

- Favoriser la composition : garder les primitives dans `components/ui` et la logique métier dans `pages/` ou `services/`.
- Éviter la duplication : extraire les hooks réutilisables et utils dans `src/components/ui` ou `src/utils`.
