import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from './token.service';

// Configuration Axios pour l'API EMIT
const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
// Debug : log à chaque requête
axiosConfig.interceptors.request.use((config) => {
  if (config.url?.includes('/auth/refresh')) {
    console.debug('[DEBUG] Appel /auth/refresh, cookie envoyé:', document.cookie);
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];
let isBootstrapping = true;

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

axiosConfig.interceptors.request.use(
  (config) => {
    // Ajouter le token d'accès aux en-têtes de la requête
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Gérer les erreurs de requête
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
axiosConfig.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Gérer les erreurs de réponse
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      clearAccessToken();
      // Ne pas forcer de reload, laisser React gérer la redirection ou l'affichage d'erreur
      if (isBootstrapping) {
        console.debug('[DEBUG] 401 intercepté pendant bootstrap, aucune redirection.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;
axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isBootstrapping) {
        // On ne tente pas de refresh automatique pendant le bootstrap
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosConfig(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axiosConfig.post('/auth/refresh');
        const newToken = res.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return axiosConfig(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
// Permet à AuthProvider d'indiquer la fin du bootstrap
export function setAxiosBootstrapping(val) {
  isBootstrapping = val;
}