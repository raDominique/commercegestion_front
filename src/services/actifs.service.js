import axiosInstance from './axios.config';

/**
 * Récupère un actif par son ID (GET /api/v1/actifs/get-by-id/:id)
 * @param {string} id - ID de l'actif
 * @param {string} token - Token d'authentification (optionnel)
 * @returns {Promise<Object>} - Données de l'API
 */
export const getActifById = async (id, token) => {
  const response = await axiosInstance.get(
    `/api/v1/actifs/get-by-id/${id}`,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'accept': 'application/json',
      },
    }
  );
  return response.data;
};

/**
 * Récupère un ou plusieurs actifs par leurs IDs (GET /api/v1/actifs/get-by-ids?ids=id1,id2,...)
 * @param {string|string[]} ids - Un ID ou un tableau d'IDs
 * @param {string} token - Token d'authentification (optionnel)
 * @returns {Promise<Object>} - Données de l'API
 */
export const getActifsByIds = async (ids, token) => {
  const idsParam = Array.isArray(ids) ? ids.join(',') : ids;
  const response = await axiosInstance.get(
    `/api/v1/actifs/get-by-ids`,
    {
      params: { ids: idsParam },
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'accept': '*/*',
      },
    }
  );
  return response.data;
};

/**
 * Récupère les dépôts d'un détenteur (GET /api/v1/actifs/my-deposits)
 * @param {Object} [params] - Paramètres de requête optionnels
 * @param {string} [params.detenteurId] - ID du détenteur/fournisseur pour filtrer les actifs déposés
 * @param {string} [params.siteId] - ID du site de dépôt pour filtrer les actifs déposés sur ce site
 * @param {number} [params.page=1] - Numéro de la page
 * @param {number} [params.limit=10] - Nombre d'actifs par page
 * @param {string} [params.search] - Recherche par nom de produit ou code CPC
 * @param {string} token - Token d'authentification Bearer
 * @returns {Promise<Object>} - Données de l'API
 */
export const getMyDeposits = async (params = {}, token) => {
  const response = await axiosInstance.get(
    '/api/v1/actifs/my-deposits',
    {
      params,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'accept': 'application/json',
      },
    }
  );
  return response.data;
};

export default {
  getActifById,
  getActifsByIds,
  getMyDeposits,
};
