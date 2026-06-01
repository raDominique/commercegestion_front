import axiosInstance from './axios.config';

/**
 * Add shop items to available inventory
 * @param {Object} data - Shop item data
 * @param {string} data.productId - Product ID
 * @param {string} data.siteId - Site ID
 * @param {string} data.actifId - Asset ID
 * @param {number} data.quantite - Quantity
 * @param {number} data.prixUnitaire - Unit price
 * @param {string} data.description - Item description
 * @param {string} [token] - Optional bearer token
 * @returns {Promise<Object>} Response data from the API
 */
export const addShopItem = async (data, token) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    accept: '*/*',
  };

  const response = await axiosInstance.post(
    '/api/v1/shop/shop-items',
    {
      productId: data.productId,
      siteId: data.siteId,
      actifId: data.actifId,
      quantite: data.quantite,
      prixUnitaire: data.prixUnitaire,
      description: data.description,
    },
    { headers }
  );

  return response.data;
};

export const getShopItems = async (params = {}, token) => {
  const headers = {
    accept: '*/*',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!params || Object.keys(params).length === 0) {
    const response = await axiosInstance.get('/api/v1/shop/shop-items', { headers });
    return response.data;
  }

  const response = await axiosInstance.get('/api/v1/shop/shop-items', { params, headers });
  return response.data;
};

/**
 * Récupère les annonces du vendeur courant (GET /shop/shop-items/mine)
 * @param {Object} params - Paramètres optionnels (search, limit, page, sortBy, order)
 * @param {string} token - Token d'authentification (Bearer)
 * @returns {Promise<Object>} Résultat de l'API
 */
export const getMyShopItems = async (params = {}, token) => {
  const headers = {
    accept: '*/*',
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await axiosInstance.get('/api/v1/shop/shop-items/mine', { params, headers });
  return response.data;
};

export default {
  addShopItem,
  getShopItems,
  getMyShopItems,
};
