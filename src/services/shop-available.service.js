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

export default {
  addShopItem,
};
