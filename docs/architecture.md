# Architecture & Structure

Résumé rapide

- Framework: React (v19)
- Build: Vite
- UI: composants personnalisés dans `src/components/ui/`, MUI icons present
- State & Context: React Contexts dans `src/context/` (ex: `AuthContext`, `CartContext`)
- API: axios via `src/services/` (config centralisée dans `axios.config.js`)
- Temps réel: `socket.io-client` via `src/services/socket.service.js`

Arborescence clef

- `src/main.jsx` — point d'entrée, providers (Router, Contexts)
- `src/App.jsx` — wrapper principal de l'application
- `src/routes/` — définition des routes et logique de navigation (`AppRoutes.jsx`, `routes.js`)
- `src/pages/` — pages principales classées par domaines (Boutique, Depot, Admin, etc.)
- `src/components/` — composants partagés et UI primitives
  - `components/ui/` — primitives (button, input, card, table, etc.)
  - `components/Layout/` — header, footer, sidebar, layout
  - `components/commons/` — composants utilitaires (CartSheet, ImageWithFallback...)
- `src/services/` — services d'accès au back-end (auth, user, product, media, socket...)
- `src/context/` — providers applicatifs (authentification, panier)

Points d'attention

- Centraliser les configurations d'API et le token handling dans `axios.config.js` et `token.service.js`.
- Respecter la séparation UI / logique métier : les composants UI sont agnostiques, la logique d'appel est dans `services/`.
