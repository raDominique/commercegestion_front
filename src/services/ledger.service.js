
import axiosInstance from './axios.config';

/**
 * Récupère le grand livre complet d'un utilisateur (GET /api/v1/ledger/user/{userId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout les données du grand livre de l'utilisateur
 */
export const getUserLedger = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/api/v1/ledger/user/${userId}`, { params });
  return response.data;
};

/**
 * Récupère les mouvements d'actifs d'un utilisateur (GET /api/v1/ledger/actifs/{userId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout la liste des mouvements d'actifs
 */
export const getActifs = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/api/v1/ledger/actifs/${userId}`, { params });
  return response.data;
};

/**
 * Récupère les mouvements de passifs d'un utilisateur (GET /api/v1/ledger/passifs/{userId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout la liste des mouvements de passifs
 */
export const getPassifs = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/api/v1/ledger/passifs/${userId}`, { params });
  return response.data;
};

export default {
  getUserLedger,
  getActifs,
  getPassifs
};
