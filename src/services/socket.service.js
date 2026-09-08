// Service Socket.io pour notifications temps réel
// Conforme à docs/WEBSOCKET_NOTIFICATIONS.md :
//   io(API_URL, { query: { userId, userAccess }, transports: ['websocket', 'polling'] })
//   userAccess ∈ 'USER' | 'ADMIN' | 'SUPERADMIN' — rooms user_{userId} + admin_room.
import { io } from 'socket.io-client';

let socket = null;
let connectionKey = null;

function isObjectIdLike(value) {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value.trim());
}

/**
 * URL socket : base HTTP(S) telle quelle (socket.io gère l'upgrade).
 * Ne pas convertir en ws:// manuellement.
 */
export function getSocketUrl() {
  const base = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
  return typeof base === 'string' ? base.replace(/\/+$/, '') : '';
}

/**
 * Normalise le rôle frontend vers le rôle attendu par la gateway.
 * Frontend : 'Utilisateur' | 'Moderateur' | 'Admin'
 * Backend : 'USER' | 'ADMIN' | 'SUPERADMIN'
 */
export function mapUserAccessToSocket(userAccess) {
  const v = String(userAccess || '').trim().toLowerCase();
  if (v === 'superadmin' || v === 'super-admin' || v === 'super_admin') return 'SUPERADMIN';
  if (v === 'admin' || v === 'moderateur' || v === 'modératrice' || v === 'moderator') return 'ADMIN';
  return 'USER';
}

export function isSocketAdmin(socketRole) {
  return socketRole === 'ADMIN' || socketRole === 'SUPERADMIN';
}

/**
 * Extrait l'ObjectId utilisateur pour la query socket.
 * getProfile() expose `_id` (ObjectId) et `userId` (code parrain 8 car.) :
 * on privilégie `_id` / `id`, on n'accepte `userId` que s'il ressemble à un ObjectId.
 */
export function extractSocketUserId(profile) {
  if (!profile) return null;
  if (typeof profile === 'string') return profile;
  const candidates = [profile._id, profile.id, profile.userId, profile._doc?._id];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) {
      // Accepte l'ObjectId en priorité ; accepte tout identifiant non vide en repli
      // sauf le code parrain court quand un meilleur candidat existe.
      if (isObjectIdLike(c)) return c.trim();
    }
  }
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}

/**
 * Initialise la connexion socket.io (idempotente par userId+role+url).
 * @param {string} url - URL HTTP(S) du serveur (ex: https://api-etokisana.tsirylab.com)
 * @param {Object} params - { userId, userAccess } (rôle déjà mappé ou non)
 */
export function initSocket(url, params) {
  const userId = typeof params?.userId === 'string' ? params.userId : extractSocketUserId(params);
  const userAccess = mapUserAccessToSocket(params?.userAccess ?? params?.role);
  if (!url || !userId) return null;

  const key = `${url}|${userId}|${userAccess}`;
  if (socket && connectionKey === key) return socket;
  if (socket) {
    try { socket.disconnect(); } catch { /* noop */ }
    socket = null;
    connectionKey = null;
  }

  socket = io(url, {
    query: { userId, userAccess },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 15000,
  });
  connectionKey = key;

  socket.on('connect_error', (err) => {
    console.debug('[socket] connect_error:', err?.message || err);
  });
  socket.on('disconnect', (reason) => {
    console.debug('[socket] disconnect:', reason);
  });
  return socket;
}

/**
 * Garantit un socket connecté pour un profil donné.
 * @param {Object|string} profile - profil getProfile() ou userId brut
 * @param {string} [roleOverride]
 */
export function ensureSocket(profile, roleOverride) {
  const url = getSocketUrl();
  if (!url) return null;
  const userId = extractSocketUserId(profile);
  const rawRole = roleOverride ?? profile?.userAccess;
  if (!userId || !rawRole) return null;
  return initSocket(url, { userId, userAccess: rawRole });
}

/**
 * Récupère l'instance socket courante
 */
export function getSocket() {
  return socket;
}

export function isConnected() {
  return !!socket?.connected;
}

/**
 * Ferme la connexion socket — à appeler uniquement au logout,
 * jamais dans le cleanup d'un composant (socket partagé).
 */
export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch { /* noop */ }
    socket = null;
    connectionKey = null;
  }
}

/**
 * Ecoute un événement socket.io
 * @param {string} event - Nom de l'événement
 * @param {function} callback - Callback à exécuter
 */
export function onSocketEvent(event, callback) {
  if (!socket) return;
  socket.on(event, callback);
}

/**
 * Retire un listener d'événement
 * @param {string} event
 * @param {function} callback
 */
export function offSocketEvent(event, callback) {
  if (!socket) return;
  if (callback) socket.off(event, callback);
  else socket.off(event);
}
