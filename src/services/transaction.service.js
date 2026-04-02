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