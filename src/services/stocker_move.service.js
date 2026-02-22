import axiosInstance from './axios.config.js';

/**
 * Effectue un dépôt de stock (transfert de produit entre sites)
 * @param {Object} params - Paramètres du dépôt
 * @param {string} params.siteOrigineId - ID du site d'origine
 * @param {string} params.siteDestinationId - ID du site de destination
 * @param {string} params.productId - ID du produit
 * @param {number} params.quantite - Quantité à transférer
 * @param {string} params.type - Type de mouvement (ex: 'Depot')
 * @param {string} [params.observations] - Observations facultatives
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */


/**
 * Effectue un dépôt de stock (transfert de produit entre sites)
 * @param {Object} params - Paramètres du dépôt
 * @param {string} params.siteOrigineId - ID du site d'origine
 * @param {string} params.siteDestinationId - ID du site de destination
 * @param {string} params.productId - ID du produit
 * @param {number} params.quantite - Quantité à transférer
 * @param {string} params.type - Type de mouvement (ex: 'Depot')
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
            type: params.type,
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