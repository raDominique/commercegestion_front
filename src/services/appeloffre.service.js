import axiosInstance from './axios.config';

/**
 * Récupère la liste des appels d'offre (tenders)
 * GET /api/v1/tenders/tenders
 * @param {Object} params - Options de requête (page, limit, sortBy, order...)
 * @param {string} token - Token d'authentification (optionnel)
 * @returns {Promise}
 */
export const getTenders = async (params = {}, token) => {
  const {
    search,
    statut,
    order = 'desc',
    sortBy = 'createdAt',
    limit = 20,
    page = 1,
    ...rest
  } = params || {};

  const query = {
    ...(search ? { search } : {}),
    ...(statut ? { statut } : {}),
    sortBy,
    order,
    limit,
    page,
    ...rest,
  };

  return axiosInstance.get(
    '/api/v1/tenders/tenders',
    {
      params: query,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

/**
 * Récupère les appels d'offre de l'utilisateur connecté
 * GET /api/v1/tenders/tenders/mine
 * @param {Object} params - Options de requête (page, limit...)
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getMyTenders = async (params = {}, token) => {
  const { limit = 20, page = 1, ...rest } = params || {};
  const query = { limit, page, ...rest };
  return axiosInstance.get(
    '/api/v1/tenders/tenders/mine',
    {
      params: query,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

export default {
  getTenders,
};
