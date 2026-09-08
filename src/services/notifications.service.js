import axiosInstance from './axios.config';

/**
 * Historique des notifications persistées (docs/WEBSOCKET_NOTIFICATIONS.md).
 * GET /api/v1/notifications?page=1&limit=20 — Authorization Bearer via axios.config.
 * Réponse paginée avec isRead, createdAt, etc. (forme exacte tolérée).
 */
export async function getNotifications(page = 1, limit = 20) {
  const res = await axiosInstance.get('/api/v1/notifications', { params: { page, limit } });
  const data = res?.data;
  if (Array.isArray(data)) return { items: data, total: data.length };
  if (Array.isArray(data?.data)) return { items: data.data, total: data.total ?? data.data.length };
  if (Array.isArray(data?.items)) return { items: data.items, total: data.total ?? data.items.length };
  if (Array.isArray(data?.notifications)) return { items: data.notifications, total: data.total ?? data.notifications.length };
  return { items: [], total: 0 };
}

/** Marque une notification comme lue (best-effort, endpoints tolérés). */
export async function markNotificationAsRead(id) {
  if (!id) return null;
  const attempts = [
    () => axiosInstance.patch(`/api/v1/notifications/${id}/read`),
    () => axiosInstance.patch(`/api/v1/notifications/${id}`, { isRead: true }),
    () => axiosInstance.post(`/api/v1/notifications/${id}/read`),
  ];
  let lastError = null;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      return res?.data ?? null;
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

/** Marque tout comme lu (best-effort). */
export async function markAllNotificationsAsRead() {
  const attempts = [
    () => axiosInstance.patch('/api/v1/notifications/read-all'),
    () => axiosInstance.post('/api/v1/notifications/read-all'),
    () => axiosInstance.patch('/api/v1/notifications', { isRead: true }),
  ];
  let lastError = null;
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      return res?.data ?? null;
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
