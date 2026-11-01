# Authentification à deux facteurs (2FA) - TOTP (détaillé)

## Vue d'ensemble
La 2FA utilise le protocole TOTP (Time-based One-Time Password), compatible avec Google Authenticator, Microsoft Authenticator, Authy, etc.

## Endpoints backend

### 1. Activer la 2FA
- **POST** `/auth/2fa/enable` (authentifié)
- **Headers** : `Authorization: Bearer <accessToken>`
- **Réponse** :
```json
{
  "secret": "BASE32SECRET...",
  "qrCodeDataUrl": "data:image/png;base64,..."
}
```
- Le frontend affiche le QR code. L'utilisateur scanne avec son authenticator.

### 2. Vérifier et activer
- **POST** `/auth/2fa/verify` (authentifié)
- **Headers** : `Authorization: Bearer <accessToken>`
- **Body** : `{ "token": "123456" }`
- **Réponse** :
```json
{ "enabled": true }
```
- À appeler après que l'utilisateur a saisi le code généré par son authenticator.

### 3. Désactiver
- **POST** `/auth/2fa/disable` (authentifié)
- **Headers** : `Authorization: Bearer <accessToken>`
- **Body** : `{ "token": "123456" }`
- **Réponse** :
```json
{ "enabled": false }
```

### 4. Login avec 2FA
- **POST** `/api/v1/auth/login`
- **Body** :
```json
{
  "userEmail": "user@example.com",
  "userPassword": "password",
  "rememberMe": true
}
```
- Pour un compte avec 2FA activée, le backend renvoie un challenge temporaire sans tokens :
```json
{
  "require2FA": true,
  "loginChallenge": "...",
  "methods": ["totp", "email-otp"]
}
```
- Si la 2FA n'est pas activée, le login par e-mail et mot de passe crée directement la session. L'activation de la 2FA reste facultative et se fait dans **Paramètres > Sécurité**.
- Pour un compte avec 2FA, l'utilisateur choisit un seul facteur. Pour le TOTP, le frontend affiche le code et l'envoie à **POST** `/api/v1/auth/2fa/totp/verify` :
```json
{
  "loginChallenge": "...",
  "totpToken": "123456"
}
```
- La validation du TOTP émet les tokens et termine la connexion.
- Pour le facteur e-mail, le frontend appelle **POST** `/api/v1/auth/2fa/email-challenge` avec `{ "loginChallenge": "..." }`, puis valide le code via **POST** `/api/v1/auth/2fa/email/verify` avec `{ "loginChallenge": "emailChallengeToken...", "emailOtpToken": "654321" }`. Les tokens sont émis après validation du code.
- L'OTP e-mail expire après 10 minutes. Pour un renvoi, le frontend appelle **POST** `/api/v1/auth/2fa/email-challenge` avec `{ "loginChallenge": "emailChallengeToken..." }`; le backend limite les renvois.
- Les noms `userEmail` et `userPassword` correspondent au contrat API déjà utilisé par ce frontend.

## Champs utilisateur (schéma MongoDB)
- `twoFactorSecret?: string` (select: false — ne jamais renvoyer au client)
- `twoFactorEnabled: boolean` (défaut `false`)
- `twoFactorBackupCodes?: string[]` (codes de secours hashés)

## Flux frontend détaillé

### Enrôlement
1. L'utilisateur va dans **Paramètres > Sécurité**.
2. Clique sur "Activer la 2FA".
3. Appel `POST /auth/2fa/enable`.
4. Afficher le QR code (`qrCodeDataUrl`) et le secret en texte (pour saisie manuelle).
5. L'utilisateur scanne le QR code avec son authenticator.
6. L'utilisateur saisit le code à 6 chiffres généré.
7. Appel `POST /auth/2fa/verify` avec le code.
8. Afficher les codes de secours (à stocker en lieu sûr).
9. Confirmer l'activation.

### Connexion
1. L'utilisateur saisit email + mot de passe.
2. Le frontend transmet également `rememberMe`. Si la 2FA n'est pas activée, la connexion est établie directement.
3. Si la 2FA est activée, le backend renvoie les méthodes disponibles et un `loginChallenge`, sans access token ni refresh token.
4. L'utilisateur choisit le TOTP ou l'OTP e-mail. La session est établie dès la validation du facteur choisi. Le bouton « Se souvenir de moi » est transmis au backend, qui applique la durée de vie correspondante aux refresh tokens.

### Désactivation
1. L'utilisateur saisit son code TOTP actuel.
2. Appel `POST /auth/2fa/disable`.
3. Confirmer la désactivation.

## Gestion des erreurs
- `400 Bad Request` : code TOTP invalide ou 2FA non initialisée.
- `401 Unauthorized` : token JWT invalide/expiré.

## Sécurité
- Le secret TOTP est stocké avec `select: false` pour ne jamais être exposé.
- Rate limiting requis sur `/auth/2fa/verify`, `/auth/2fa/totp/verify`, `/auth/2fa/email/verify`, `/auth/2fa/email-challenge`, `/auth/2fa/use-backup-code` et `/auth/2fa/disable`.
- Les codes de secours doivent être hashés (comme les mots de passe).
- Le backend doit invalider le challenge après utilisation, expiration ou trois échecs et empêcher la réutilisation d’un code TOTP.
- Le facteur e-mail n'est disponible que si l’adresse est vérifiée; les OTP expirent après 10 minutes et les renvois sont limités.
- En production, le refresh token doit être émis et révoqué par le serveur dans un cookie `HttpOnly; Secure; SameSite=Strict`. Un refresh token renvoyé dans le JSON ne peut pas être rendu HttpOnly par le frontend.
- Utiliser HTTPS en production.

## Dépendances
- `otplib` : génération et vérification TOTP.
- `qrcode` : génération du QR code en data URL.

## Notes d'implémentation backend
- Les méthodes `enable2FA`, `verify2FA`, `disable2FA` sont dans `AuthService`.
- Les endpoints sont dans `AuthController` sous `/auth/2fa/*`.
- Le backend doit implémenter les endpoints de challenge TOTP/e-mail et de validation des codes de secours décrits plus haut; ils ne peuvent pas être remplacés par du code frontend.
- Ajouter `rememberMe` au DTO de login et renvoyer le cookie refresh sécurisé côté serveur. Les tokens ne doivent être émis qu’après validation du facteur.
- La 2FA est facultative à la première connexion. Son activation est réservée à l'utilisateur authentifié dans ses paramètres de sécurité.
