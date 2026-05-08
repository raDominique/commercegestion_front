import axiosInstance from './axios.config';

/**
 * Récupère un passif par son ID (GET /api/v1/passifs/:id)
 * @param {string} id - ID du passif
 * @param {string} token - Token d'authentification (optionnel)
 * @returns {Promise<Object>} - Données de l'API
 */
export const getPassifById = async (id, token) => {
  const response = await axiosInstance.get(
    `/api/v1/passifs/${id}`,
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
  getPassifById,
};
