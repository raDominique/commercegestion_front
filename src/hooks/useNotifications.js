import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getProfile } from '../services/auth.service';
import { countUnreadByRoute, resolveNotificationTarget } from '../utils/notificationTarget';
import {
  ensureSocket,
  onSocketEvent,
  offSocketEvent,
  isSocketAdmin,
  mapUserAccessToSocket,
} from '../services/socket.service';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notifications.service';

function normalizeNotif(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw._id ?? raw.id ?? `${raw.createdAt ?? Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    _id: id,
    id,
    title: raw.title ?? null,
    message: raw.message ?? '',
    isRead: raw.isRead ?? false,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    type: raw.type ?? null,
    metadata: raw.metadata ?? null,
  };
}

function formatDate(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString();
  } catch {
    return '';
  }
}

/** Date relative courte en français : "à l'instant", "il y a 5 min", "il y a 2 h", sinon date locale. */
function formatRelative(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return 'à l’instant';
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return 'à l’instant';
    if (min < 60) return `il y a ${min} min`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `il y a ${hours} h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `il y a ${days} j`;
    return d.toLocaleDateString();
  } catch {
    return '';
  }
}

const MAX_STORED_READ_IDS = 300;

function storageKey(prefix, userKey) {
  return `etokisana:notif:${prefix}:${userKey || 'anon'}`;
}

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // stockage indisponible : on reste en mémoire seule
  }
}

function loadReadIds(userKey) {
  try {
    const raw = safeGet(storageKey('read', userKey));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function loadClearedAt(userKey) {
  const raw = safeGet(storageKey('clearedAt', userKey));
  const ts = raw ? Number(raw) : 0;
  return Number.isFinite(ts) ? ts : 0;
}

function createdAtMs(value) {
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

/**
 * Hook notifications temps réel + historique REST.
 * Conforme à docs/WEBSOCKET_NOTIFICATIONS.md :
 *  - query { userId (ObjectId), userAccess (USER|ADMIN|SUPERADMIN) }
 *  - events 'notification' (+ 'admin_event' pour ADMIN/SUPERADMIN)
 *  - historique GET /api/v1/notifications
 * Persistance locale par utilisateur : "Tout marquer lu" vide la liste et
 * mémorise un horodatage — les notifications antérieures ne réapparaissent
 * pas après actualisation, seules les nouvelles s'affichent.
 */
export function useNotifications() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const subscribed = useRef(false);
  const navigate = useNavigate();

  const isAdmin = profile?.userAccess === 'Admin' || profile?.userAccess === 'Moderateur';

  const userKey = useMemo(
    () => String(profile?._id ?? profile?.userId ?? profile?.id ?? 'anon'),
    [profile],
  );
  // Horodatage du dernier "Tout marquer lu" (0 = jamais) : les notifications
  // créées avant sont considérées comme traitées, même après actualisation.
  const clearedAtRef = useRef(0);

  // Profil une fois
  useEffect(() => {
    let mounted = true;
    getProfile()
      .then((data) => { if (mounted) setProfile(data); })
      .catch(() => { if (mounted) setProfile(null); });
    return () => { mounted = false; };
  }, []);

  // Historique REST au chargement du profil, filtré par la persistance locale
  useEffect(() => {
    if (!profile) return;
    let mounted = true;
    setLoadingHistory(true);
    const clearedAt = loadClearedAt(userKey);
    clearedAtRef.current = clearedAt;
    const readIds = new Set(loadReadIds(userKey));
    getNotifications(1, 20)
      .then(({ items }) => {
        if (!mounted) return;
        setNotifications(
          items
            .map(normalizeNotif)
            .filter(Boolean)
            // "Tout marquer lu" déjà cliqué : on oublie tout ce qui est antérieur
            .filter((n) => createdAtMs(n.createdAt) > clearedAt)
            .map((n) => (readIds.has(String(n._id)) ? { ...n, isRead: true } : n)),
        );
      })
      .catch(() => { /* historique indisponible : on garde le temps réel seul */ })
      .finally(() => { if (mounted) setLoadingHistory(false); });
    return () => { mounted = false; };
  }, [profile, userKey]);

  const markAsRead = useCallback(async (id) => {
    const idStr = String(id);
    setNotifications((prev) => prev.map((n) => (String(n._id) === idStr ? { ...n, isRead: true } : n)));
    // Persiste la lecture : le badge reste décrémenté après actualisation
    const ids = loadReadIds(userKey);
    if (!ids.includes(idStr)) {
      ids.push(idStr);
      safeSet(storageKey('read', userKey), JSON.stringify(ids.slice(-MAX_STORED_READ_IDS)));
    }
    try {
      await markNotificationAsRead(id);
    } catch {
      // best-effort : l'état local reste à jour même si le backend ne suit pas
    }
  }, [userKey]);

  // Souscription socket (sans disconnect au cleanup : socket partagé)
  useEffect(() => {
    if (!profile || subscribed.current) return;
    const socket = ensureSocket(profile);
    if (!socket) return;
    subscribed.current = true;
    const socketRole = mapUserAccessToSocket(profile.userAccess);
    const doMarkAsRead = markAsRead;

    const pushUnique = (item) => {
      // Reçu après un "Tout marquer lu" mais créé avant : traité d'office, sans badge
      const alreadyCleared = createdAtMs(item.createdAt) <= clearedAtRef.current;
      const toInsert = alreadyCleared ? { ...item, isRead: true } : item;
      setNotifications((prev) => {
        if (prev.some((n) => String(n._id) === String(toInsert._id))) return prev;
        return [toInsert, ...prev];
      });
    };
    const showToast = (item, admin) => {
      const target = resolveNotificationTarget(item, { isAdmin: admin });
      const shortMessage =
        item.message && item.message.length > 120 ? `${item.message.slice(0, 117)}…` : item.message;
      const toastFn = admin && item.type === 'ADMIN_ALERT' ? toast.warning : toast.info;
      toastFn(item.title || 'Notification', {
        description: shortMessage || undefined,
        action: {
          label: 'Voir',
          onClick: () => {
            doMarkAsRead(item._id);
            navigate(target.path);
          },
        },
      });
    };
    const notifHandler = (data) => {
      const notif = normalizeNotif(data);
      if (!notif) return;
      pushUnique(notif);
      showToast(notif, false);
    };
    const adminHandler = (data) => {
      const evt = normalizeNotif({ ...data, type: data?.type ?? 'ADMIN_ALERT' });
      if (!evt) return;
      pushUnique(evt);
      showToast(evt, true);
    };

    onSocketEvent('notification', notifHandler);
    if (isSocketAdmin(socketRole)) onSocketEvent('admin_event', adminHandler);

    return () => {
      offSocketEvent('notification', notifHandler);
      if (isSocketAdmin(socketRole)) offSocketEvent('admin_event', adminHandler);
      subscribed.current = false;
    };
  }, [profile, markAsRead, navigate]);

  // "Tout marquer lu" : vide la liste + mémorise l'instant pour que les
  // notifications et pastilles ne reviennent pas après actualisation.
  const markAllRead = useCallback(async () => {
    const now = Date.now();
    clearedAtRef.current = now;
    safeSet(storageKey('clearedAt', userKey), String(now));
    safeSet(storageKey('read', userKey), JSON.stringify([]));
    setNotifications([]);
    try {
      await markAllNotificationsAsRead();
    } catch {
      // best-effort : la persistance locale garantit déjà le résultat
    }
  }, [userKey]);

  const clear = useCallback(() => setNotifications([]), []);

  /** Clic sur une notification : marque lue + redirige vers la page métier concernée. */
  const openNotification = useCallback(
    (notif) => {
      if (!notif) return null;
      markAsRead(notif._id);
      const target = resolveNotificationTarget(notif, { isAdmin });
      navigate(target.path);
      return target;
    },
    [markAsRead, navigate, isAdmin],
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadByRoute = useMemo(
    () => countUnreadByRoute(notifications, { isAdmin }),
    [notifications, isAdmin],
  );

  return {
    profile,
    isAdmin,
    notifications,
    unreadCount,
    unreadByRoute,
    loadingHistory,
    markAsRead,
    markAllRead,
    openNotification,
    clear,
    formatDate,
    formatRelative,
  };
}
