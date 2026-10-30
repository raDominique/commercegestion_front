import { createContext, useContext, useState, useEffect } from 'react';

import {
  loginUser,
  refreshToken,
  logoutUser,
  getProfile,
  verifyLoginEmailOtp as verifyLoginEmailOtpRequest,
  verifyLoginTotp as verifyLoginTotpRequest,
} from '../services/auth.service';
import { getAccessToken, setAccessToken, clearAccessToken } from '../services/token.service';
import { setAxiosBootstrapping } from '../services/axios.config';

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // infos extraites du token
  const [loading, setLoading] = useState(true); // loading initial
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [twoFactorEnrollmentRequired, setTwoFactorEnrollmentRequired] = useState(false);


  // Décoder le payload du JWT (sans vérif signature)
  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  const establishSession = async (data) => {
    if (!data?.accessToken) {
      throw new Error('Aucun accessToken reçu');
    }

    const profile = await getProfile();
    setTwoFactorEnrollmentRequired(profile?.twoFactorEnabled !== true);
    setUser({ ...decodeJWT(data.accessToken), ...profile });
    setIsAuthenticated(true);
    setError(null);
    return profile;
  };



  // The refresh endpoint also supports server-managed HttpOnly cookies.
  useEffect(() => {
    async function initAuth() {
      setAxiosBootstrapping(true);
      setLoading(true);
      try {
        const newToken = await refreshTokenFn();
        setAccessToken(newToken);
        const profile = await getProfile();
        setTwoFactorEnrollmentRequired(profile?.twoFactorEnabled !== true);
        const decoded = decodeJWT(newToken);
        setUser(decoded || profile);
        setIsAuthenticated(true);
        setError(null);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
        setTwoFactorEnrollmentRequired(false);
        const sessionRejected = [401, 403].includes(err?.response?.status);
        setError(sessionRejected ? null : 'Impossible de vérifier la session');
        if (!sessionRejected) {
          console.error('[AUTH] Impossible de restaurer la session:', err);
        }
        clearAccessToken();
      } finally {
        setLoading(false);
        setAxiosBootstrapping(false);
      }
    }
    // Pour éviter shadowing avec import
    const refreshTokenFn = refreshToken;
    initAuth();
  }, []);


  // Login
  const login = async (email, password, rememberMe) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password, rememberMe);
      if (data?.loginChallenge) {
        return data;
      } else {
        if (data?.require2faSetup && data?.setupToken) {
          setAccessToken(data.setupToken);
          setUser(decodeJWT(data.setupToken) || data.user || { setupOnly: true });
          setIsAuthenticated(true);
          setTwoFactorEnrollmentRequired(true);
          return data;
        }
        return await establishSession(data);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setTwoFactorEnrollmentRequired(false);
      setError('Identifiants invalides');
      clearAccessToken();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginTotp = async (loginChallenge, totpToken) => {
    const data = await verifyLoginTotpRequest(loginChallenge, totpToken);
    if (data?.status === 'error') {
      throw new Error(data?.message || 'Le serveur n’a pas confirmé le code Authenticator.');
    }
    return data;
  };

  const completeLoginChallenge = async (data) => {
    if (data?.accessToken) {
      return establishSession(data);
    }
    return data;
  };

  const completeEmailOtpLogin = async (emailChallengeToken, emailOtpToken, rememberMe) => {
    const data = await verifyLoginEmailOtpRequest(emailChallengeToken, emailOtpToken, rememberMe);
    if (!data?.accessToken) {
      throw new Error('Le serveur n’a pas confirmé la connexion avec le code e-mail.');
    }
    return establishSession(data);
  };

  const completeTwoFactorEnrollment = async () => {
    const profile = await getProfile();
    if (profile?.twoFactorEnabled !== true) {
      throw new Error('La configuration 2FA n’a pas été confirmée par le serveur.');
    }
    const token = getAccessToken();
    setUser({ ...decodeJWT(token), ...profile });
    setIsAuthenticated(true);
    setTwoFactorEnrollmentRequired(false);
    return profile;
  };


  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setTwoFactorEnrollmentRequired(false);
      setError(null);
      clearAccessToken();
      setLoading(false);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        twoFactorEnrollmentRequired,
        login,
        verifyLoginTotp,
        completeLoginChallenge,
        completeEmailOtpLogin,
        completeTwoFactorEnrollment,
        logout,
        getProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}
