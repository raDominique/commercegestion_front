# Développement local

Prérequis

- Node.js >= 18 recommandé
- npm (ou utilisez `pnpm`/`yarn` si vous préférez, adaptez les commandes)

Installation

1. Cloner le dépôt

```
git clone <url-du-repo>
cd commercegestion_front
```

2. Installer les dépendances

```
npm install
```

3. Lancer le serveur de développement

```
npm run dev
```

Configuration et variables d'environnement

Créez un fichier `.env` à la racine si nécessaire. Exemples de variables possibles (adapter selon backend) :

- `VITE_API_BASE_URL=https://api.example.com`
- `VITE_SOCKET_URL=https://realtime.example.com`
- `VITE_GOOGLE_MAPS_KEY=YOUR_KEY`

Remarques

- Vite expose les variables commençant par `VITE_` dans le code client via `import.meta.env`.
- Vérifiez `src/services/axios.config.js` pour le comportement lié aux env vars et aux tokens.

Scripts utiles (voir package.json)

- `npm run dev` — démarrage en mode développement
- `npm run build` — build production
- `npm run preview` — prévisualisation du build
- `npm run lint` — lint du projet

Linting & formatting

- Le dépôt contient ESLint. Configurez votre éditeur pour appliquer le linting à l'enregistrement.

Build & déploiement

- `npm run build` génère le dossier `dist/` prêt pour le déploiement sur un hébergeur static.
