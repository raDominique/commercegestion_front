// actifs.service.js
// Service pour récupérer les actifs de l'utilisateur connecté
import axiosConfig from './axios.config';

// /**
//  * Récupère la liste des actifs de l'utilisateur connecté
//  * @param {Object} params - Paramètres de requête optionnels
//  * @param {string} [params.sortOrder] - Ordre de tri (asc ou desc)
//  * @param {string} [params.sortBy] - Champ de tri
//  * @param {string} [params.siteId] - Filtrer par site
//  * @param {string} [params.search] - Recherche texte
//  * @param {number} [params.limit] - Nombre d'éléments par page
//  * @param {number} [params.page] - Numéro de page
//  * @param {string} token - Token d'authentification
//  * @returns {Promise}
//  */
// export const getMyActifs = async (params = {}) => {
//     if (!params || Object.keys(params).length === 0) {
//         const response = await axiosConfig.get('/api/v1/actifs/me')
//         return response.data;
//     }

//     const response = await axiosConfig.get('/api/v1/actifs/me', { params });
//     return response.data;
// };

/**
 * Récupère un actif spécifique par son ID
 * @param {string} actifId - L'identifiant de l'actif
 * @param {string} token - Le token d'authentification Bearer
 * @returns {Promise}
 */
export const getActifById = async (actifId) => {
    if (!actifId) throw new Error('actifId et token sont requis');
    const response = await axiosConfig.get(`/api/v1/actifs/${actifId}`, {
        headers: {
            'accept': '*/*',
        },
    });
    return response.data;
};
