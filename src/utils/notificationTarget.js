/**
 * Mapping notification -> page métier concernée.
 * Priorité : metadata explicite (kind/route/transactionId) > mots-clés du titre > défaut.
 * Les titres backend connus : "Nouveau Dépôt", "Dépôt approuvé/rejeté",
 * "Nouveau Retrait", "Retrait approuvé/rejeté", ventes, échanges, virements,
 * parrainages, et `admin_event` (ADMIN_ALERT).
 */

const KEYWORD_ROUTES = [
  { test: /appel[\s-]?offre/i, path: '/appel-offre', label: "Appel d'offres" },
  { test: /virement/i, path: '/virement-droit', label: 'Virement de droit' },
  { test: /échange|echange/i, path: '/echange-actifs', label: "Échange d'actifs" },
  { test: /vente|achat/i, path: '/achat-vente', label: 'Achat/Vente' },
  { test: /dépôt|depot/i, path: '/depot', label: 'Dépôt' },
  { test: /retrait/i, path: '/retrait', label: 'Retrait' },
  { test: /parrain/i, path: '/parrainages', label: 'Parrainages' },
  { test: /produit/i, path: '/mes-produits', label: 'Mes produits' },
  { test: /boutique|commande/i, path: '/boutique', label: 'Boutique' },
  { test: /site/i, path: '/mes-sites', label: 'Mes sites' },
  { test: /compte|profil|validation|inscription|utilisateur/i, path: '/admin/utilisateurs', label: 'Utilisateurs', adminOnly: true },
];

function normalizeText(value) {
  return typeof value === 'string' ? value.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';
}

export function resolveNotificationTarget(notif, { isAdmin = false } = {}) {
  const metadata = notif?.metadata && typeof notif.metadata === 'object' ? notif.metadata : null;

  // 1. Metadata explicite (si le backend l'envoie un jour)
  const explicitRoute = metadata?.route || metadata?.path || metadata?.link;
  if (typeof explicitRoute === 'string' && explicitRoute.startsWith('/')) {
    return { path: explicitRoute, label: metadata?.label || 'Voir' };
  }
  const kind = metadata?.kind || metadata?.type || notif?.type;
  if (typeof kind === 'string') {
    const byKind = KEYWORD_ROUTES.find((r) => normalizeText(kind).match(r.test) || kind === r.path);
    if (byKind && (!byKind.adminOnly || isAdmin)) return { path: byKind.path, label: byKind.label };
  }

  // 2. Mots-clés du titre puis du message
  const haystack = `${notif?.title || ''} ${notif?.message || ''}`;
  const match = KEYWORD_ROUTES.find((r) => r.test.test(haystack) && (!r.adminOnly || isAdmin));
  if (match) return { path: match.path, label: match.label };

  // 3. Alertes admin -> opérations à valider ; défaut user -> mes transactions
  if (notif?.type === 'ADMIN_ALERT' || isAdmin && /admin/i.test(notif?.title || '')) {
    return { path: '/operations-a-valider', label: 'Opérations à valider' };
  }
  return { path: '/mes-transactions', label: 'Mes transactions' };
}

/** Formate un compteur : 100 et plus s'affichent "+99". */
export function formatNotifCount(count) {
  const n = Number(count) || 0;
  return n >= 100 ? '+99' : n;
}

/**
 * Compte les non-lues par route cible.
 * @param {Array} notifications - notifications normalisées { _id, title, message, isRead, metadata, type }
 * @param {Object} opts - { isAdmin }
 * @returns {Object} { '/depot': 2, ... }
 */
export function countUnreadByRoute(notifications, opts) {
  const counts = {};
  for (const notif of notifications || []) {
    if (!notif || notif.isRead) continue;
    const { path } = resolveNotificationTarget(notif, opts);
    counts[path] = (counts[path] || 0) + 1;
  }
  return counts;
}
