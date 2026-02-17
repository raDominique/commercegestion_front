import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyToken, refreshToken, logoutUser, getProfile } from '../services/auth.service';
import { getAccessToken, clearAccessToken } from '../services/token.service';
import { setAxiosBootstrapping } from '../services/axios.config';

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // infos extraites du token
  const [loading, setLoading] = useState(true); // loading initial
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Décoder le payload du JWT (sans vérif signature)
  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  // Initialisation robuste : appel unique à /auth/refresh au mount, logs de debug, synchronisation avec axios
  useEffect(() => {
    async function initAuth() {
      setAxiosBootstrapping(true);
      setLoading(true);
      let bootstrapped = false;
      try {
        const token = getAccessToken();
        if (token) {
          try {
            await verifyToken(token);
            const decoded = decodeJWT(token);
            setUser(decoded);
            setIsAuthenticated(true);
            setError(null);
            console.debug('[DEBUG] Token en mémoire valide, utilisateur restauré.');
            bootstrapped = true;
          } catch {
            // Token en mémoire invalide, on tente refresh
          }
        }
        if (!bootstrapped) {
          // Appel unique à /auth/refresh
          try {
            console.debug('[DEBUG] Appel /auth/refresh au mount (initAuth)');
            const newToken = await refreshToken();
            console.debug('[DEBUG] Nouveau accessToken reçu:', newToken);
            const decoded = decodeJWT(newToken);
            setUser(decoded);
            setIsAuthenticated(true);
            setError(null);
          } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
            setError('Session expirée');
            clearAccessToken();
            console.debug('[DEBUG] Echec du refresh au mount:', err);
          }
        }
      } finally {
        setLoading(false);
        setAxiosBootstrapping(false);
      }
    }
    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser(email, password);
      if (data && data.accessToken) {
        const decoded = decodeJWT(data.accessToken);
        setUser(decoded);
        setIsAuthenticated(true);
        setError(null);
      } else {
        throw new Error('Aucun accessToken reçu');
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setError('Identifiants invalides');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register (optionnel, expose la fonction)
  const register = async (formData) => registerUser(formData);

  // Logout
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setUser(null);
      setIsAuthenticated(false);
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
        login,
        logout,
        register,
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
