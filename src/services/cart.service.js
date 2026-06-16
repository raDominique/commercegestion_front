import axiosInstance from './axios.config';

/**
 * Valide la commande (checkout)
 * POST /api/v1/cart/checkout
 * @param {Object} data - { siteDestinationId, observations }
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const checkoutCart = async (data, token) => {
  return axiosInstance.post(
    '/api/v1/cart/checkout',
    data,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
};

/**
 * Récupère les commandes du panier
 * GET /api/v1/cart/orders?limit=10&page=1
 * @param {Object} params - { limit, page }
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getCartOrders = async (params, token) => {
  return axiosInstance.get(
    '/api/v1/cart/orders',
    {
      params,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

/**
 * Récupère une commande par son ID
 * GET /api/v1/cart/orders/:id
 * @param {string} id - ID de la commande
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getCartOrderById = async (id, token) => {
  return axiosInstance.get(
    `/api/v1/cart/orders/${id}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

/**
 * Vide le panier de l'utilisateur connecté
 * DELETE /api/v1/cart
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const clearCart = async (token) => {
  return axiosInstance.delete(
    '/api/v1/cart',
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

/**
 * Retire un article du panier
 * DELETE /api/v1/cart/item/:id
 * @param {string} id - ID de l'article dans le panier
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const removeCartItem = async (id, token) => {
  return axiosInstance.delete(
    `/api/v1/cart/item/${id}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

/**
 * Modifie la quantité d'un article dans le panier
 * PATCH /api/v1/cart/item/:id
 * @param {string} id - ID de l'article dans le panier
 * @param {Object} data - { quantite }
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const updateCartItem = async (id, data, token) => {
  return axiosInstance.patch(
    `/api/v1/cart/item/${id}`,
    data,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
};

/**
 * Ajoute un article au panier
 * POST /api/v1/cart/add
 * @param {Object} data - { shopItemId, quantite }
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const addToCart = async (data, token) => {
  return axiosInstance.post(
    '/api/v1/cart/add',
    data,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
};

/**
 * Récupère le panier de l'utilisateur connecté
 * GET /api/v1/cart
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getCart = async (token) => {
  return axiosInstance.get(
    '/api/v1/cart',
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};
