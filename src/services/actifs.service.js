// actifs.service.js
// Service pour récupérer les actifs de l'utilisateur connecté
import axiosConfig from './axios.config';

/**
 * Récupère la liste des actifs de l'utilisateur connecté
 * @param {Object} params - Paramètres de requête optionnels
 * @param {string} [params.sortOrder] - Ordre de tri (asc ou desc)
 * @param {string} [params.sortBy] - Champ de tri
 * @param {string} [params.siteId] - Filtrer par site
 * @param {string} [params.search] - Recherche texte
 * @param {number} [params.limit] - Nombre d'éléments par page
 * @param {number} [params.page] - Numéro de page
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getMyActifs = async (params = {}, token) => {
    if (!params || Object.keys(params).length === 0) {
        const response = await axiosConfig.get('/api/v1/actifs/me')
        return response.data;
    }

    const response = await axiosConfig.get('/api/v1/actifs/me', { params });
    return response.data;
};
