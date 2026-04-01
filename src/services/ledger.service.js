
import axiosInstance from './axios.config';

/**
 * Récupère le grand livre complet d'un utilisateur (GET /api/ledger/user/{userId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout les données du grand livre de l'utilisateur
 */
export const getUserLedger = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/api/ledger/user/${userId}`, { params });
  return response.data;
};

/**
 * Récupère le grand livre global (GET /api/ledger/global)
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout les données du grand livre global
 */
export const getGlobalLedger = async (params = {}) => {
  const response = await axiosInstance.get('/api/ledger/global', { params });
  return response.data;
};

/**
 * Récupère l'historique d'un produit (GET /api/ledger/product/{productId})
 * @param {string} productId - L'identifiant du produit
 * @param {Object} [params] - Paramètres additionnels pour la requête, ex: { userId }
 * @returns {Promise<Object>} - Une promesse qui résout l'historique du produit
 */
export const getProductLedger = async (productId, params = {}) => {
  const response = await axiosInstance.get(`/api/ledger/product/${productId}`, { params });
  return response.data;
};

/**
 * Récupère la fiche de stock (stock-card) d'un utilisateur pour un produit (GET /api/ledger/stock-card/{userId}/{productId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {string} productId - L'identifiant du produit
 * @returns {Promise<Object>} - Une promesse qui résout la fiche de stock du produit pour l'utilisateur
 */
export const getStockCard = async (userId, productId) => {
  const response = await axiosInstance.get(`/api/ledger/stock-card/${userId}/${productId}`);
  return response.data;
};

/**
 * Récupère les mouvements d'actifs d'un utilisateur (GET /api/ledger/actifs/{userId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout la liste des mouvements d'actifs
 */
export const getActifs = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/api/ledger/actifs/${userId}`, { params });
  return response.data;
};

/**
 * Récupère les mouvements de passifs d'un utilisateur (GET /api/ledger/passifs/{userId})
 * @param {string} userId - L'identifiant de l'utilisateur
 * @param {Object} [params] - Paramètres additionnels pour la requête (optionnel)
 * @returns {Promise<Object>} - Une promesse qui résout la liste des mouvements de passifs
 */
export const getPassifs = async (userId, params = {}) => {
  const response = await axiosInstance.get(`/api/ledger/passifs/${userId}`, { params });
  return response.data;
};

export default {
  getUserLedger,
  getGlobalLedger,
  getProductLedger,
  getStockCard,
  getActifs,
  getPassifs
};
