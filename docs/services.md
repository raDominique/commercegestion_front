# Services API

Tous les appels réseau sont centralisés dans `src/services/`.

Fichiers notables

- `axios.config.js` — configuration globale d'Axios (baseURL, interceptors pour injecter token, gestion d'erreurs).
- `auth.service.js` — login, logout, refresh token, validation utilisateur.
- `token.service.js` — stockage/lecture du token (cookies ou localStorage via `js-cookie`).
- `user.service.js`, `product.service.js`, `media.service.js`, `site.service.js`, `cpc.service.js`, etc. — wrappers spécifiques par ressource.
- `socket.service.js` — initialisation du client Socket.IO et events.

Recommandations

- Centraliser la logique de retry / gestion d'erreurs dans les interceptors d'Axios.
- Ne pas appeler `localStorage`/`document.cookie` directement dans les services — utiliser `token.service.js` pour l'abstraction.

Sécurité

- Ne jamais exposer les secrets côté client.
- Valider les réponses API et gérer proprement les erreurs réseau et erreurs métier.
