import axiosInstance from './axios.config';
import { setAccessToken, clearAccessToken, setRefreshToken, getRefreshToken, clearRefreshToken } from './token.service';

// Connexion utilisateur : POST /auth/login
export async function loginUser(userEmail, userPassword) {
  try {
    const response = await axiosInstance.post('/api/v1/auth/login', { userEmail, userPassword }, {
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
    });
    if (response.data && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    if (response.data && response.data.refreshToken) {
      // Expiration 7 jours par défaut
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setRefreshToken(response.data.refreshToken, { expires });
    }
    return response.data;
  } catch (error) {
    if (error?.response?.status === 500) {
      console.error('[AUTH] Erreur serveur 500 lors du login:', error?.response?.data || error);
      throw new Error("Erreur interne du serveur. Veuillez réessayer plus tard ou contacter l'administrateur.");
    }
    throw error;
  }
}

// Refresh accessToken : POST /auth/refresh (refreshToken envoyé via cookie JS)
export async function refreshToken() {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('Aucun refreshToken trouvé');
    const response = await axiosInstance.post('/api/v1/auth/refresh', { refreshToken });
    if (response.data && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        // Si le backend renvoie un nouveau refreshToken, on le met à jour
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        setRefreshToken(response.data.refreshToken, { expires });
      }
      return response.data.accessToken;
    } else {
      throw new Error('Aucun accessToken retourné');
    }
  } catch (error) {
    clearAccessToken();
    clearRefreshToken();
    throw error;
  }
}

// Récupère le profil utilisateur : GET /getProfile
export async function getProfile() {
  try {
    const response = await axiosInstance.get('/api/v1/auth/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Déconnexion : POST /auth/logout (refreshToken supprimé côté backend)
export async function logoutUser() {
  try {
    const refreshToken = getRefreshToken();
    await axiosInstance.post('/api/v1/auth/logout', { refreshToken });
  } finally {
    clearAccessToken();
    clearRefreshToken();
  }
}
