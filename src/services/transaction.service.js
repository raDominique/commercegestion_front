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
        '/api/transactions/deposit',
        {
            siteOrigineId: params.siteOrigineId,
            siteDestinationId: params.siteDestinationId,
            productId: params.productId,
            quantite: Number(params.quantite),
            detentaire: params.detentaire,
            ayant_droit: params.ayant_droit,
            prixUnitaire: Number(params.prixUnitaire),
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
 * Effectue un retour de stock à un membre (transfert de produit entre sites)
 * @param {Object} params - Paramètres du retour
 * @param {string} params.detentaire - ID du détentaire
 * @param {string} params.ayant_droit - ID de l'ayant droit
 * @param {string} params.productId - ID du produit
 * @param {string} params.siteOrigineId - ID du site d'origine
 * @param {string} params.siteDestinationId - ID du site de destination
 * @param {number} params.quantite - Quantité à transférer
 * @param {number} params.prixUnitaire - Prix unitaire du produit
 * @param {string} [params.observations] - Observations facultatives
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const depositStockToAMember = async (params, token) => {
    return axiosInstance.post(
        '/api/transactions/return',
        {
            detentaire: params.detentaire,
            ayant_droit: params.ayant_droit,
            productId: params.productId,
            siteOrigineId: params.siteOrigineId,
            siteDestinationId: params.siteDestinationId,
            quantite: Number(params.quantite),
            prixUnitaire: Number(params.prixUnitaire),
            observations: params.observations || '',
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
        }
    );
};

/**
 * Récupère la liste des transactions en attente (GET /transactions/pending/list)
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Résultat de l'API contenant la liste des transactions en attente
 */
export const getPendingTransactionsList = async (token) => {
    return axiosInstance.get(
        '/api/transactions/pending/list',
        {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json',
            },
        }
    );
};