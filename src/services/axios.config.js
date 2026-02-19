import axios from "axios";
import { getAccessToken, setAccessToken, clearAccessToken } from './token.service';

const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});
// Debug : log à chaque requête

// Debug : log à chaque requête /auth/refresh
axiosConfig.interceptors.request.use((config) => {
  if (config.url?.includes('/api/v1/auth/refresh')) {
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
    // Injecte le token d'accès si présent
    const token = getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour les réponses

// Premier intercepteur : 401 pendant bootstrap => pas de redirection
axiosConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      if (isBootstrapping) {
        console.debug('[DEBUG] 401 intercepté pendant bootstrap, aucune redirection.');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;

// Second intercepteur : gestion du refresh automatique, queue, retry, redirection si refresh échoue
axiosConfig.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isBootstrapping) {
        // Pas de refresh auto pendant bootstrap
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
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
        // Redirige vers /login si refresh échoue définitivement
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
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