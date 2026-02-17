// src/services/token.service.js
// Service pour gérer le stockage du accessToken uniquement en mémoire (singleton)

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}
