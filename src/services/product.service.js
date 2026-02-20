import axiosInstance from './axios.config';

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
export const getProducts = async ({ isStocker = '', search = '', limit = 10, page = 1 } = {}, token) => {
    try {
        const response = await axiosInstance.get(
            '/api/v1/products',
            {
                params: {
                    isStocker,
                    search,
                    limit,
                    page,
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
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
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getMyProducts = async (token) => {
    const response = await axiosInstance.get(
        '/api/v1/products/me',
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*',
            },
        }
    );
    return response.data;
};
