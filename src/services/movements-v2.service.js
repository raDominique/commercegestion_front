import axiosInstance from './axios.config';

const postMovement = async (movement, payload) => {
  const response = await axiosInstance.post(`/api/v2/movements/${movement}`, payload);
  return response.data;
};

export const depositMovement = (payload) => postMovement('deposit', payload);

export const transferMovement = (payload) => postMovement('transfer', payload);

export const exchangeMovement = (payload) => postMovement('exchange', payload);

export const withdrawMovement = (payload) => postMovement('withdraw', payload);

export const getMovementErrorMessage = (error, fallback) => {
  const message = error?.response?.data?.message;
  if (Array.isArray(message) && message.length > 0) return message.join(', ');
  if (typeof message === 'string' && message.trim()) return message;

  if (error?.response?.status === 400) {
    return 'Les données du mouvement sont invalides. Vérifiez notamment la quantité saisie.';
  }
  if (error?.response?.status === 401) {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }
  return fallback;
};

export default {
  depositMovement,
  transferMovement,
  exchangeMovement,
  withdrawMovement,
  getMovementErrorMessage,
};
