import axiosInstance from './axios.config.js';

/**
 * Récupère toutes les sessions d'audit
 * GET /api/v1/audit/audit/get-all-sessions
 * @param {Object} [params] - Paramètres de requête (page, limit, filtres...)
 * @param {number} [params.page] - Numéro de page (par défaut: 1)
 * @param {number} [params.limit] - Nombre d'éléments par page (par défaut: 10)
 * @param {string} token - Token d'authentification (Bearer)
 * @returns {Promise}
 */
export const getAllSessions = async (params = {}, token) => {
    const { page = 1, limit = 10, ...rest } = params || {};
    const query = { page, limit, ...rest };

    return axiosInstance.get(
        '/api/v1/audit/audit/get-all-sessions',
        {
            params: query,
            headers: {
                Authorization: `Bearer ${token}`,
                accept: '*/*',
            },
        }
    );
};


/**
 * Exporte les sessions d'audit au format Excel ou PDF
 * GET /api/v1/audit/audit/export?format=excel|pdf
 * Renvoie un blob (fichier) — utiliser responseType: 'blob'
 * @param {string} format - 'excel' ou 'pdf'
 * @param {Object} [params] - Paramètres de requête additionnels
 * @param {string} token - Token d'authentification (Bearer)
 * @returns {Promise<Blob>} - Réponse binaire du serveur
 */
export const exportAudit = async (format = 'excel', params = {}, token) => {
    const query = { format, ...params };

    return axiosInstance.get(
        '/api/v1/audit/audit/export',
        {
            params: query,
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}`,
                accept: '*/*',
            },
        }
    );
};

export default {
    getAllSessions,
    exportAudit,
};
