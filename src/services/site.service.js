
import axiosConfig from './axios.config';

/**
 * Crée un site (POST /sites/create)
 * @param {Object} siteData - Les données du site à créer
 * @param {string} siteData.siteName - Le nom du site
 * @param {string} siteData.siteAddress - L'adresse physique du site 
 * @param {number} siteData.siteLat - La latitude du site
 * @param {number} siteData.siteLng - La longitude du site
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export async function createSite(siteData) {
    try {
        const response = await axiosConfig.post('/api/v1/sites', siteData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la création du site:', error);
        throw error;
    }
};

/**
 * Récupère la liste paginée des sites de l'utilisateur connecté (GET /sites/me)
 * @param {Object} params - Les paramètres de pagination et de recherche
 * @param {number} params.limit - Nombre d'éléments par page
 * @param {number} params.page - Numéro de page
 * @param {string} [params.search] - Terme de recherche optionnel
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export const getMySites = async ({ limit = 10, page = 1, search = '' } = {}) => {
    try {
        const response = await axiosConfig.get('/api/v1/sites/me', {
            params: {
                limit,
                page,
                ...(search ? { search } : {}),
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des sites:', error);
        throw error;
    }
};

/**
 * Récupère un site par son ID (GET /sites/get-by-id/:id)
 * @param {string} id - L'identifiant du site
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export async function getSiteById(id) {
    try {
        const response = await axiosConfig.get(`/api/v1/sites/get-by-id/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du site par ID:', error);
        throw error;
    }
}

/**
 * Met à jour un site (PATCH /sites/update/:id)
 * @param {string} id - L'identifiant du site
 * @param {Object} siteData - Les données à mettre à jour
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export async function updateSite(id, siteData) {
    try {
        const response = await axiosConfig.patch(`/api/v1/sites/update/${id}`, siteData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du site:', error);
        throw error;
    }
}

/**
 * Supprime un site (DELETE /sites/delete/:id)
 * @param {string} id - L'identifiant du site
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export async function deleteSite(id) {
    try {
        const response = await axiosConfig.delete(`/api/v1/sites/delete/${id}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression du site:', error);
        throw error;
    }
}


/**
 * Récupère tous les sites avec pagination et recherche (GET /sites)
 * @param {Object} params - Les paramètres de pagination et de recherche
 * @param {string} [params.search] - Terme de recherche optionnel
 * @param {number} [params.limit] - Nombre d'éléments par page
 * @param {number} [params.page] - Numéro de page
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export async function getAllSites({ search = '', limit = 10, page = 1 } = {}) {
    try {
        const response = await axiosConfig.get('/api/v1/sites', {
            params: {
                ...(search ? { search } : {}),
                limit,
                page,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les sites:', error);
        throw error;
    }
}