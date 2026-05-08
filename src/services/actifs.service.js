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

export default {
  getActifById,
};
