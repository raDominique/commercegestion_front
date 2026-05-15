import axiosInstance from './axios.config';

/**
 * Récupère les statistiques du tableau de bord
 * @returns {Promise<Object>} Les statistiques du dashboard
 */
export async function getStatsDashboard() {
  try {
    const res = await axiosInstance.get('/api/v1/dashboard/stats-dashboard', {
      headers: {
        'accept': '*/*',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques du dashboard:', error);
    throw error;
  }
}
