# Etokisana Commerce Gestion Front

Ce projet est le front-end de la plateforme Etokisana Commerce Gestion, développé avec React et Vite.

## Prérequis
- Node.js (version 18 ou supérieure recommandée)
- npm (installé avec Node.js)

## Installation

1. **Cloner le dépôt**

```
git clone <url-du-repo>
```

2. **Se placer dans le dossier du projet**

```
cd commercegestion_front
```

3. **Installer les dépendances**

```
npm install
```

4. **Lancer le serveur de développement**

```
npm run dev
```

5. **Accéder à l'application**

Ouvrez votre navigateur et allez sur :

```
http://localhost:3000
```

## Structure du projet

- `src/` : code source React
- `public/` : fichiers statiques
- `components/ui/` : composants UI personnalisés
- `services/` : appels API
- `pages/` : pages principales
- `styles/` : styles CSS

## Personnalisation
- Modifiez les fichiers dans `src/pages/` pour adapter les pages.
- Ajoutez vos composants dans `src/components/ui/`.

## Build pour production

```
npm run build
```

Le dossier `dist/` sera généré.

## Déploiement
Déployez le contenu du dossier `dist/` sur votre hébergement web.