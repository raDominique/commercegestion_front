// Déconnexion utilisateur via API (invalide le refreshToken côté backend)
export async function logoutUser(refreshToken) {
  try {
    const response = await axiosInstance.post('/auth/logout', { refreshToken }, {
      headers: {
        'Content-Type': 'application/json',
        'accept': '*/*',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
// Récupère le profil utilisateur authentifié
export async function getProfile() {
  try {
    const response = await axiosInstance.get('/auth/profile', {
      headers: {
        'accept': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
// Rafraîchit le accessToken via le refreshToken (stocké en HttpOnly cookie)
export async function refreshToken() {
  try {
    const response = await axiosInstance.post('/auth/refresh');
    if (response.data && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    } else {
      throw new Error('Aucun accessToken retourné');
    }
  } catch (error) {
    clearAccessToken();
    // Message utilisateur plus explicite
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Session expirée ou jeton de rafraîchissement invalide. Veuillez vous reconnecter.');
  }
}
// src/services/auth.service.js
import axiosInstance from './axios.config';
import { setAccessToken, clearAccessToken } from './token.service';

// Vérification du token d'accès
export async function verifyToken(accessToken) {
  try {
    const response = await axiosInstance.post(
      '/auth/verify-token',
      {},
      {
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
// Inscription utilisateur avec fichiers (multipart/form-data)
export async function registerUser(formData) {
  // formData doit être une instance de FormData
  try {
    const response = await axiosInstance.post('/v1/users', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}


// Connexion utilisateur via API
export async function loginUser(userEmail, userPassword) {
  try {
    const response = await axiosInstance.post('/auth/login', {
      userEmail,
      userPassword,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
    });
    // accessToken dans le body, refreshToken dans HttpOnly cookie
    if (response.data && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
}



export function logout() {
  clearAccessToken();
  // Le backend doit gérer la suppression du refreshToken (cookie) via un endpoint logout si besoin
}

// Désormais inutile : l'utilisateur courant doit être extrait du token ou via /me si besoin
export function getCurrentUser() {
  return null;
}

// Désormais inutile : l'authentification dépend du accessToken en mémoire
export function isAuthenticated() {
  return !!getAccessToken();
}
