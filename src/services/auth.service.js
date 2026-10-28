// Changement de mot de passe : POST /auth/change-password
/**
 * Change le mot de passe de l'utilisateur connecté
 * @param {Object} data - { currentPassword, newPassword, confirmPassword }
 * @param {string} accessToken - Token JWT d'authentification
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function changePassword(data, accessToken) {
  if (!data || !data.currentPassword || !data.newPassword || !data.confirmPassword) {
    throw new Error('Tous les champs sont requis');
  }
  const res = await axiosInstance.post('/api/v1/auth/change-password', data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'accept': '*/*',
    },
  });
  return res.data;
}

import axiosInstance from './axios.config';
import { setAccessToken, clearAccessToken, setRefreshToken, getRefreshToken, clearRefreshToken } from './token.service';

/**
 * Crée un nouvel utilisateur (POST /users)
 * @param {Object} data - Les données utilisateur à envoyer (voir champs requis)
 * @returns {Promise<Object>} Résultat de l'API
 *
 * Champs supportés dans data :
 * - userMainLng, userPhone, userType, userPassword, userAddress, userFirstname, userEmail, documentType, userName, identityCardNumber, userNickName, userMainLat, managerName, managerEmail, parrainID1, parrainID2
 * - Fichiers : carteFiscal (array ou File), logo (File), documents (array ou File), carteStat (File), avatar (File)
 */
export async function createUser(data) {
  if (!data) throw new Error('data est requis');
  const formData = new FormData();
  // Champs simples (accept both parrain1ID/parrain2ID used by the frontend)
  [
    'userMainLng', 'userPhone', 'userType', 'userPassword', 'userAddress',
    'userFirstname', 'userDateOfBirth', 'userEmail', 'documentType', 'userName', 'identityCardNumber',
    'userNickName', 'userMainLat', 'managerName', 'managerEmail', 'parrain1ID', 'parrain2ID'
  ].forEach(key => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      formData.append(key, data[key]);
    }
  });

  // Helper to append either file(s) or plain string values safely
  const appendField = (fd, name, value) => {
    if (value === undefined || value === null) return;
    // If array, append each element
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (item === undefined || item === null) return;
        if (typeof item === 'string') {
          fd.append(name, item);
        } else if (item instanceof File || (item && item.name)) {
          fd.append(name, item, item.name);
        } else {
          // Fallback: append JSON string
          try { fd.append(name, JSON.stringify(item)); } catch (e) { fd.append(name, String(item)); }
        }
      });
      return;
    }
    // Single value
    if (typeof value === 'string') {
      fd.append(name, value);
      return;
    }
    if (value instanceof File || (value && value.name)) {
      fd.append(name, value, value.name);
      return;
    }
    try { fd.append(name, JSON.stringify(value)); } catch (e) { fd.append(name, String(value)); }
  };

  // Fichiers multiples ou champs pouvant être string
  const fileFields = ['carteFiscal', 'documents', 'carteStat'];
  fileFields.forEach(field => {
    appendField(formData, field, data[field]);
  });

  // Fichiers uniques (logo, avatar) - accept strings or File/Blob
  ['logo', 'avatar'].forEach(field => appendField(formData, field, data[field]));

  const res = await axiosInstance.post('/api/v1/users', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

function saveAuthTokens(data, rememberMe) {
  if (data?.accessToken) {
    setAccessToken(data.accessToken);
  }
  if (data?.refreshToken) {
    const options = rememberMe
      ? { expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
      : {};
    setRefreshToken(data.refreshToken, options);
  }
}

// Connexion utilisateur : POST /auth/login
export async function loginUser(userEmail, userPassword, rememberMe = false) {
  try {
    const payload = { userEmail, userPassword, rememberMe };
    const response = await axiosInstance.post('/api/v1/auth/login', payload, {
      headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
    });
    if (
      !response.data?.require2FA
      && !response.data?.requireBothFactors
      && !response.data?.loginChallenge
    ) {
      saveAuthTokens(response.data, rememberMe);
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

export async function verifyLoginTotp(loginChallenge, totpToken) {
  const response = await axiosInstance.post('/api/v1/auth/2fa/totp/verify', {
    loginChallenge,
    totpToken,
  });
  return response.data;
}

export async function verifyLoginEmailOtp(emailChallengeToken, emailOtpToken, rememberMe = false) {
  const response = await axiosInstance.post('/api/v1/auth/2fa/email/verify', {
    loginChallenge: emailChallengeToken,
    emailOtpToken,
  });
  if (response.data?.status === 'error' || !response.data?.accessToken) {
    throw new Error(
      response.data?.message
        || 'Le serveur n’a pas confirmé la connexion après la vérification e-mail.',
    );
  }
  saveAuthTokens(response.data, rememberMe);
  return response.data;
}

export async function requestEmailOtp(emailChallengeToken) {
  const response = await axiosInstance.post('/api/v1/auth/2fa/email-challenge', {
    loginChallenge: emailChallengeToken,
  });
  return response.data;
}

export async function useBackupCode(loginChallenge, backupCode, rememberMe = false) {
  const response = await axiosInstance.post('/api/v1/auth/2fa/use-backup-code', {
    loginChallenge,
    backupCode,
  });
  saveAuthTokens(response.data, rememberMe);
  return response.data;
}

// Authentification à deux facteurs (TOTP)
export async function enableTwoFactor() {
  const response = await axiosInstance.post('/api/v1/auth/2fa/enable');
  return response.data;
}

export async function verifyTwoFactor(token, rememberMe = false) {
  const response = await axiosInstance.post('/api/v1/auth/2fa/verify', { token });
  saveAuthTokens(response.data, rememberMe);
  return response.data;
}

export async function disableTwoFactor(token) {
  const response = await axiosInstance.post('/api/v1/auth/2fa/disable', { token });
  return response.data;
}

// Demande de réinitialisation du mot de passe : POST /auth/forgot-password
export async function forgotPassword(payload) {
  if (!payload) throw new Error('payload est requis');
  const response = await axiosInstance.post('/api/v1/auth/forgot-password', payload, {
    headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
  });
  return response.data;
}

// Réinitialisation du mot de passe : POST /auth/reset-password
export async function resetPassword(payload) {
  if (!payload) throw new Error('payload est requis');
  const response = await axiosInstance.post('/api/v1/auth/reset-password', payload, {
    headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
  });
  return response.data;
}

// Refresh accessToken using a server HttpOnly cookie or the legacy JSON-token cookie.
export async function refreshToken() {
  try {
    const refreshToken = getRefreshToken();
    const response = await axiosInstance.post(
      '/api/v1/auth/refresh',
      refreshToken ? { refreshToken } : {},
    );
    if (response.data && response.data.accessToken) {
      setAccessToken(response.data.accessToken);
      if (response.data.refreshToken) {
        setRefreshToken(response.data.refreshToken);
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
  const response = await axiosInstance.get('/api/v1/auth/profile');
  return response.data;
}

// Déconnexion : POST /auth/logout (refreshToken supprimé côté backend)
export async function logoutUser() {
  try {
    const refreshToken = getRefreshToken();
    await axiosInstance.post('/api/v1/auth/logout', refreshToken ? { refreshToken } : {});
  } finally {
    clearAccessToken();
    clearRefreshToken();
  }
}
