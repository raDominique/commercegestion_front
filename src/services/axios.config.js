import axios from "axios";
import Cookies from "js-cookie";

// Configuration Axios pour l'API EMIT
const axiosConfig = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosConfig.interceptors.request.use(
    (config) => {
        // Ajouter le token d'accès aux en-têtes de la requête
        const accessToken = Cookies.get("auth_token");
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
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
            Cookies.remove("auth_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosConfig;