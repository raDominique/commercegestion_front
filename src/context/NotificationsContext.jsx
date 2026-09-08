import { createContext, useContext } from 'react';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsContext = createContext(null);

/**
 * Source partagée des notifications (une seule souscription socket + un seul
 * chargement d'historique pour Header + Sidebar).
 * Doit être monté dans le Router (utilise useNavigate via useNotifications).
 */
export function NotificationsProvider({ children }) {
  const value = useNotifications();
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsContext() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotificationsContext doit être utilisé dans <NotificationsProvider>');
  return ctx;
}
