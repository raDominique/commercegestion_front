// Service Socket.io pour notifications temps réel
import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialise la connexion socket.io
 * @param {string} url - URL du serveur socket.io (ex: http://localhost:3000)
 * @param {Object} params - Paramètres de connexion (userId, userAccess)
 */
export function initSocket(url, params) {
  if (socket) return socket;
  socket = io(url, {
    query: params,
    transports: ['websocket'],
  });
  return socket;
}

/**
 * Récupère l'instance socket courante
 */
export function getSocket() {
  return socket;
}

/**
 * Ferme la connexion socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
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
  socket.off(event, callback);
}
