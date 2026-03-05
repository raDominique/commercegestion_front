# Routes & Navigation

Fichiers principaux

- `src/routes/routes.js` — définition d'objets/constantes représentant chaque route (path, nom, meta).
- `src/routes/AppRoutes.jsx` — mapping des routes vers leurs composants React, gestion des routes protégées via `ProtectedRoute`.

Protection des routes

- `ProtectedRoute.jsx` vérifie l'état d'`AuthContext` et redirige vers `Login` si l'utilisateur n'est pas authentifié.

Bonnes pratiques

- Garder la définition des chemins centralisée dans `routes.js` pour éviter les strings hardcodées.
- Utiliser des wrappers pour la logique de permission (rôles, feature flags) si nécessaire.
