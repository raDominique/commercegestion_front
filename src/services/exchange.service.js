import axiosInstance from './axios.config';

/**
 * Crée une nouvelle offre d'échange (POST /api/v1/exchange/offers)
 * @param {Object} payload - Données de l'offre d'échange
 * @param {string} payload.productAId - ID du produit A (vendu)
 * @param {number} payload.quantiteA - Quantité du produit A
 * @param {string} payload.detentaireAId - ID du détenteur du produit A
 * @param {string} payload.depotAId - ID du dépôt du produit A
 * @param {string} payload.productBId - ID du produit B (contrepartie)
 * @param {number} payload.tauxEchange - Taux d'échange
 * @param {string[]} [payload.acceptedDetenteurBIds] - IDs des détenteurs acceptés pour le produit B
 * @param {string} token - Token d'authentification Bearer
 * @returns {Promise<Object>} - Données de l'API
 */
export const createExchangeOffer = async (payload, token) => {
  const response = await axiosInstance.post('/api/v1/exchange/offers', payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return response.data;
};

/**
 * Récupère les offres d'échange (GET /api/v1/exchange/offers)
 * @param {Object} [params] - Paramètres de filtre et pagination
 * @param {number} [params.limit=20] - Taille de la page
 * @param {number} [params.page=1] - Numéro de la page
 * @param {number} [params.maxTaux] - Filtrer tauxEchange <= maxTaux
 * @param {number} [params.minTaux] - Filtrer tauxEchange >= minTaux
 * @param {string} [params.productAId] - Filtrer par produit A
 * @param {string} [params.productBId] - Filtrer par produit B
 * @param {string} [params.detentaireAId] - Filtrer par détenteur du produit A
 * @param {string} [params.acceptedDetenteurBId] - Filtrer par détenteur accepté pour le produit B
 * @param {string} token - Token d'authentification Bearer
 * @returns {Promise<Object>} - Données de l'API
 */
export const getExchangeOffers = async (params = {}, token) => {
  const response = await axiosInstance.get('/api/v1/exchange/offers', {
    params: {
      limit: 20,
      page: 1,
      ...params,
    },
    headers: { Authorization: `Bearer ${token}`, accept: '*/*' },
  });
  return response.data;
};

/**
 * Achète une offre d'échange (POST /api/v1/exchange/offers/:id/buy)
 * @param {string} offerId - ID de l'offre d'échange
 * @param {number} quantiteA - Quantité du produit A à acheter
 * @param {string} token - Token d'authentification Bearer
 * @returns {Promise<Object>} - Données de l'API
 */
export const buyExchangeOffer = async (offerId, quantiteA, token) => {
  const response = await axiosInstance.post(`/api/v1/exchange/offers/${offerId}/buy`, { quantiteA }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return response.data;
};

