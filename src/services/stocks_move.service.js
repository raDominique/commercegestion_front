import axiosInstance from './axios.config.js';

/**
 * Effectue un dépôt de stock (transfert de produit entre sites)
 * @param {Object} params - Paramètres du dépôt
 * @param {string} params.siteOrigineId - ID du site d'origine
 * @param {string} params.siteDestinationId - ID du site de destination
 * @param {string} params.productId - ID du produit
 * @param {number} params.quantite - Quantité à transférer
 * @param {number} params.prixUnitaire - Prix unitaire du produit
 * @param {string} [params.observations] - Observations facultatives
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const depositStock = async (params, token) => {
    return axiosInstance.post(
        '/api/v1/stocks/deposit',
        {
            siteOrigineId: params.siteOrigineId,
            siteDestinationId: params.siteDestinationId,
            productId: params.productId,
            quantite: params.quantite,
            prixUnitaire: params.prixUnitaire,
            observations: params.observations || '',
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: '*/*',
            },
        }
    );
};

/**
 * Effectue un dépôt de stock (transfert de produit entre sites)
 * @param {Object} params - Paramètres du dépôt
 * @param {string} params.siteOrigineId - ID du site d'origine
 * @param {string} params.siteDestinationId - ID du site de destination
 * @param {string} params.productId - ID du produit
 * @param {number} params.quantite - Quantité à transférer
 * @param {number} params.prixUnitaire - Prix unitaire du produit
 * @param {string} [params.observations] - Observations facultatives
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const withdrawStock = async (params, token) => {
    return axiosInstance.post(
        '/api/v1/stocks/withdraw',
        {
            siteOrigineId: params.siteOrigineId,
            siteDestinationId: params.siteDestinationId,
            productId: params.productId,
            quantite: params.quantite,
            prixUnitaire: params.prixUnitaire,
            observations: params.observations || '',
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: '*/*',
            },
        }
    );
};

/**
 * Récupère les actifs de stock de l'utilisateur connecté
 * @param {string} token - Le token d'authentification Bearer
 * @returns {Promise}
 * Récupère les actifs de stock de l'utilisateur connecté avec filtres
 * @param {Object} params - Paramètres de filtre et pagination
 * @param {number} [params.limit] - Nombre d'éléments par page
 * @param {number} [params.page] - Numéro de page
 * @param {string} [params.endDate] - Date de fin
 * @param {string} [params.startDate] - Date de début
 * @param {string} [params.movementType] - Type de mouvement
 * @param {string} [params.productId] - Filtrer par produit
 * @param {string} [params.siteId] - Filtrer par site
 * @param {string} token - Le token d'authentification Bearer
 * @returns {Promise}
 */
export const getMyStocksActifs = async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/stocks/my-actifs', {
        params,
    });
    return response.data;
};

/**
 * Récupère les passifs de stock de l'utilisateur connecté
 * @param {string} token - Le token d'authentification Bearer
 * @returns {Promise}
 * Récupère les passifs de stock de l'utilisateur connecté avec filtres
 * @param {Object} params - Paramètres de filtre et pagination
 * @param {number} [params.limit] - Nombre d'éléments par page
 * @param {number} [params.page] - Numéro de page
 * @param {string} [params.endDate] - Date de fin
 * @param {string} [params.startDate] - Date de début
 * @param {string} [params.movementType] - Type de mouvement
 * @param {string} [params.productId] - Filtrer par produit
 * @param {string} [params.siteId] - Filtrer par site
 * @param {string} token - Le token d'authentification Bearer
 * @returns {Promise}
 */
export const getMyStocksPassifs = async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/stocks/my-passifs', {
        params,
    });
    return response.data;
};