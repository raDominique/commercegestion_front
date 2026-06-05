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

/**
 * Crée un nouvel appel d'offre (tender)
 * POST /api/v1/tenders/tenders
 * @param {Object} data - Les données de l'appel d'offre
 * @param {File} [data.documentPieces] - Fichier document (optionnel)
 * @param {string} data.unite - Unité de mesure
 * @param {string} data.conditionsPaiement - Conditions de paiement
 * @param {string} data.delaiLivraisonSouhaite - Délai de livraison souhaité
 * @param {string} data.productId - ID du produit
 * @param {string} data.siteLivraison - ID du site de livraison
 * @param {string} data.titre - Titre de l'appel d'offre
 * @param {number} data.quantite - Quantité
 * @param {string} data.dateLimite - Date limite (format ISO)
 * @param {string} data.description - Description détaillée
 * @param {string} token - Token d'authentification Bearer
 * @returns {Promise}
 */
export const createTender = async (data, token) => {
  const formData = new FormData();
  if (data.documentPieces) formData.append('documentPieces', data.documentPieces);
  formData.append('unite', data.unite);
  formData.append('conditionsPaiement', data.conditionsPaiement);
  formData.append('delaiLivraisonSouhaite', data.delaiLivraisonSouhaite);
  formData.append('productId', data.productId);
  formData.append('siteLivraison', data.siteLivraison);
  formData.append('titre', data.titre);
  formData.append('quantite', data.quantite);
  formData.append('dateLimite', data.dateLimite);
  formData.append('description', data.description);

  return axiosInstance.post(
    '/api/v1/tenders/tenders',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    }
  );
};

/**
 * Récupère un appel d'offre par son ID
 * GET /api/v1/tenders/tenders/:id
 * @param {string} id - ID de l'appel d'offre
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getTenderById = async (id, token) => {
  return axiosInstance.get(
    `/api/v1/tenders/tenders/${id}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

/**
 * Supprime un appel d'offre par son ID
 * DELETE /api/v1/tenders/tenders/:id
 * @param {string} id - ID de l'appel d'offre
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const deleteTender = async (id, token) => {
  return axiosInstance.delete(
    `/api/v1/tenders/tenders/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    }
  );
};

/**
 * Crée une enchère (bid) sur un appel d'offre
 * POST /api/v1/tenders/tenders/:id/bids
 * @param {string} id - ID de l'appel d'offre
 * @param {Object} data - Les données de l'enchère
 * @param {string} data.appelOffreId - ID de l'appel d'offre
 * @param {number} data.prixUnitaire - Prix unitaire proposé
 * @param {number} data.quantite - Quantité proposée
 * @param {string} data.delaiLivraison - Délai de livraison proposé
 * @param {string} [data.observations] - Observations (optionnel)
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const createBid = async (id, data, token) => {
  return axiosInstance.post(
    `/api/v1/tenders/tenders/${id}/bids`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        accept: '*/*',
      },
    }
  );
};

/**
 * Récupère les enchères (bids) d'un appel d'offre
 * GET /api/v1/tenders/tenders/:id/bids
 * @param {string} id - ID de l'appel d'offre
 * @param {string} token - Token d'authentification
 * @returns {Promise}
 */
export const getBids = async (id, token) => {
  return axiosInstance.get(
    `/api/v1/tenders/tenders/${id}/bids`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        accept: '*/*',
      },
    }
  );
};

export default {
  getTenders,
  getMyTenders,
  createTender,
  getTenderById,
  deleteTender,
  createBid,
  getBids,
};
