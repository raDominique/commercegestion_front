import { createContext, useContext, useState, useEffect } from 'react';

import { loginUser, refreshToken, logoutUser, getProfile } from '../services/auth.service';
import { setAccessToken, clearAccessToken, getRefreshToken } from '../services/token.service';
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



  // Initialisation robuste : session persistante via refreshToken JS cookie
  useEffect(() => {
    async function initAuth() {
      setAxiosBootstrapping(true);
      setLoading(true);
      try {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const newToken = await refreshTokenFn();
            setAccessToken(newToken);
            const profile = await getProfile();
            setTwoFactorEnrollmentRequired(profile?.twoFactorEnabled !== true);
            const decoded = decodeJWT(newToken);
            setUser(decoded);
            setIsAuthenticated(true);
            setError(null);
            console.debug('[DEBUG] Session restaurée via refreshToken cookie');
          } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
            setError('Session expirée');
            clearAccessToken();
            console.debug('[DEBUG] Echec du refresh au mount:', err);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setTwoFactorEnrollmentRequired(false);
          setError(null);
          clearAccessToken();
        }
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
  const login = async (email, password, totpToken) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password, totpToken);
      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        const profile = await getProfile();
        setTwoFactorEnrollmentRequired(profile?.twoFactorEnabled !== true);
        const decoded = decodeJWT(data.accessToken);
        setUser(decoded);
        setIsAuthenticated(true);
        setError(null);
        return profile;
      } else {
        throw new Error('Aucun accessToken reçu');
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setTwoFactorEnrollmentRequired(false);
      setError('Identifiants invalides');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeTwoFactorEnrollment = () => setTwoFactorEnrollmentRequired(false);


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
