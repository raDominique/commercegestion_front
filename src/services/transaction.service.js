import axiosInstance from './axios.config';

/**
 * Crée une transaction de dépôt (POST /api/transactions/deposit)
 * @param {Object} payload - Corps de la requête
 * @param {string} token - Token d'authentification
 */
export const createDeposit = async (payload, token) => {
  const response = await axiosInstance.post(
    '/api/transactions/deposit',
    payload,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
  return response.data;
};

/**
 * Crée une transaction de retour (POST /api/transactions/return)
 */
export const createReturn = async (payload, token) => {
  const response = await axiosInstance.post(
    '/api/transactions/return',
    payload,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
  return response.data;
};

/**
 * Crée une initialisation de stock (POST /api/transactions/initialization)
 */
export const createInitialization = async (payload, token) => {
  const response = await axiosInstance.post(
    '/api/transactions/initialization',
    payload,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
  return response.data;
};

/**
 * Approuve une transaction (PATCH /api/transactions/{id}/approve)
 */
export const approveTransaction = async (id, body = {}, token) => {
  const response = await axiosInstance.patch(
    `/api/transactions/${id}/approve`,
    body,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
  return response.data;
};

/**
 * Rejette une transaction (PATCH /api/transactions/{id}/reject)
 */
export const rejectTransaction = async (id, body = {}, token) => {
  const response = await axiosInstance.patch(
    `/api/transactions/${id}/reject`,
    body,
    {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        'Content-Type': 'application/json',
        accept: '*/*',
      },
    }
  );
  return response.data;
};

export default {
  createDeposit,
  createReturn,
  createInitialization,
  approveTransaction,
  rejectTransaction,
};
