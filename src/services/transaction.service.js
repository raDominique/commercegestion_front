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
 * @param {Object} params - Paramètres de la requête
 * @param {string} params.userId - ID de l'utilisateur (Manager/Admin qui doit approuver)
 * @param {number} [params.page] - Numéro de page (défaut: 1)
 * @param {number} [params.limit] - Nombre d'éléments par page (défaut: 10)
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Résultat de l'API contenant la liste des transactions en attente
 */
export const getPendingTransactionsList = async (params, token) => {
    return axiosInstance.get(
        '/api/transactions/pending/list',
        {
            params: {
                userId: params.userId,
                page: params.page || 1,
                limit: params.limit || 10,
            },
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json',
            },
        }
    );
};

/**
 * Récupère les détails d'une transaction (GET /api/transactions/:transactionId)
 * @param {string} transactionId - ID de la transaction
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Résultat de l'API contenant les détails de la transaction
 */
export const getTransactionById = async (transactionId, token) => {
    return axiosInstance.get(
        `/api/transactions/${transactionId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                accept: 'application/json',
            },
        }
    );
};

/**
 * Approuve une transaction en attente (PATCH /api/transactions/:transactionId/approve)
 * @param {string} transactionId - ID de la transaction
 * @param {Object} params - Paramètres d'approbation
 * @param {string} params.approuveurId - ID de l'approuveur (Manager/Admin)
 * @param {string} [params.observations] - Observations facultatives
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Résultat de l'API
 */
export const approveTransaction = async (transactionId, params, token) => {
    return axiosInstance.patch(
        `/api/transactions/${transactionId}/approve`,
        {
            approuveurId: params.approuveurId,
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
 * Rejette une transaction en attente (PATCH /api/transactions/:transactionId/reject)
 * @param {string} transactionId - ID de la transaction
 * @param {Object} params - Paramètres de rejet
 * @param {string} params.approuveurId - ID de l'approuveur (Manager/Admin)
 * @param {string} params.motifRejet - Motif du rejet
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Résultat de l'API
 */
export const rejectTransaction = async (transactionId, params, token) => {
    return axiosInstance.patch(
        `/api/transactions/${transactionId}/reject`,
        {
            approuveurId: params.approuveurId,
            motifRejet: params.motifRejet,
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
 * Initialise une transaction (POST /api/transactions/initialization)
 * @param {Object} params - Paramètres de l'initialisation
 * @param {string} params.productId - ID du produit
 * @param {string} params.siteOrigineId - ID du site d'origine
 * @param {number} params.quantite - Quantité du produit
 * @param {number} params.prixUnitaire - Prix unitaire du produit
 * @param {string} [params.observations] - Observations facultatives
 * @param {string} token - Token d'authentification
 * @returns {Promise} - Résultat de l'API
 */
export const initializeTransaction = async (params, token) => {
    return axiosInstance.post(
        '/api/transactions/initialization',
        {
            productId: params.productId,
            siteOrigineId: params.siteOrigineId,
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