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

export default {
  getActifById,
  getActifsByIds,
};
