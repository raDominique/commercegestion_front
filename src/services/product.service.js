import axiosInstance from './axios.config';

/**
 * Modifie un produit existant (PUT /products/:id)
 * @param {string} id - ID du produit
 * @param {Object} productData - Les données du produit (clé/valeur)
 * @param {File} image - Fichier image à uploader
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const updateProduct = async (id, productData, image, token) => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value);
    });
    if (image) {
        formData.append('image', image);
    }
    const response = await axiosInstance.patch(
        `/api/v1/products/update/${id}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token && { Authorization: `Bearer ${token}` }),
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Récupère la liste des produits avec filtres
 * @param {Object} params - Les paramètres de recherche
 * @param {boolean} params.isStocker - Filtre stocker
 * @param {string} params.search - Recherche
 * @param {number} params.limit - Limite
 * @param {number} params.page - Page
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Réponse de l'API
 */
export const getProducts = async (params = {}) => {
    if (!params || Object.keys(params).length === 0) {
        const response = await axiosInstance.get("/api/v1/products");
        return response.data;
    }

    const response = await axiosInstance.get("/api/v1/products", { params });
    return response.data;
};

/**
 * Crée un nouveau produit (POST /products)
 * @param {Object} productData - Les données du produit (clé/valeur)
 * @param {File} image - Fichier image à uploader
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const createProduct = async (productData, image, token) => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
        formData.append(key, value);
    });
    if (image) {
        formData.append('image', image);
    }
    const response = await axiosInstance.post(
        '/api/v1/products',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...(token && { Authorization: `Bearer ${token}` }),
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Valide ou invalide un produit (PATCH /products/:id/validate)
 * @param {string} id - ID du produit
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const validateProduct = async (id, token) => {
    const response = await axiosInstance.patch(
        `/api/v1/products/toggle-validation/${id}`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Bascule la validation d'un produit (PATCH /products/toggle-validation/:id)
 * @param {string} id - ID du produit
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const toggleProductValidation = async (id, token) => {
    const response = await axiosInstance.patch(
        `/api/v1/products/toggle-validation/${id}`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Bascule l'état stocké d'un produit (PATCH /products/toggle-stocker/:id)
 * @param {string} id - ID du produit
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const toggleProductStocker = async (id, token) => {
    const response = await axiosInstance.patch(
        `/api/v1/products/toggle-stock/${id}`,
        {},
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Supprime un produit par son ID (DELETE /products/delete/:id)
 * @param {string} id - ID du produit
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const deleteProduct = async (id, token) => {
    const response = await axiosInstance.delete(
        `/api/v1/products/delete/${id}`,
        {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Récupère un produit par son ID (GET /products/:id)
 * @param {string} id - ID du produit
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getProductById = async (id, token) => {
    const response = await axiosInstance.get(
        `/api/v1/products/get-by-id/${id}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Récupère les produits de l'utilisateur courant (GET /products/me)
 * @param {Object} params - Paramètres de recherche (search, limit, page, etc.)
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getMyProducts = async (params = {}, token) => {
    const response = await axiosInstance.get(
        '/api/v1/products/me',
        {
            params,
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*',
            },
        }
    );
    return response.data;
};

/**
 * Récupère la liste des produits pour la boutique (GET /products/shop)
 * @param {Object} params - Paramètres de recherche et de tri (search, limit, page, sort, order)
 * @returns {Promise<Object>} Résultat de l'API
 */
export const getShopProducts = async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/products/shop', {
        params,
        headers: {
            'accept': '*/*',
        },
    });
    return response.data;
};
