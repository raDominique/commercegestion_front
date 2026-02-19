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
        const response = await axiosConfig.post('/sites', siteData, {
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
    const response = await axiosConfig.get('/sites/me', {
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