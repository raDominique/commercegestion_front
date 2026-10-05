// Enum-like constants for backend transaction values
export const TransactionType = Object.freeze({
  DEPOT: 'DÉPÔT',
  RETRAIT: 'RETRAIT',
  INITIALISATION: 'INITIALISATION',
  VENTE: 'VENTE',
});

export const TransactionStatus = Object.freeze({
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
});

export const MovementType = Object.freeze({
  ACTIF: 'ACTIF',
  PASSIF: 'PASSIF',
});

export const TransactionTypes = Object.values(TransactionType);
export const TransactionStatuses = Object.values(TransactionStatus);
export const MovementTypes = Object.values(MovementType);

export function isTransactionType(value) {
  return TransactionTypes.includes(value);
}

export function isTransactionStatus(value) {
  return TransactionStatuses.includes(value);
}

export function isMovementType(value) {
  return MovementTypes.includes(value);
}

// --- Badge color mappings and helpers ---
// Source unique de vérité pour les badges de toute la plateforme.
// Palette : violet = marque/approuvé, orange = attente, rouge = rejet/sortie,
// emerald = succès/stock, blue = info/transfert, neutral = défaut.
function normalizeKey(val) {
  if (val === undefined || val === null) return '';
  try {
    // Remove diacritics and non-alphanumeric characters then uppercase
    return String(val)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase();
  } catch {
    return String(val).toUpperCase();
  }
}

const DEFAULT_BADGE = { className: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: '-' };

const STATUS_BADGE_MAP = {
  PENDING: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'En attente' },
  ENATTENTE: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'En attente' },
  ATTENTE: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'En attente' },
  APPROVED: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Approuvé' },
  APPROUVE: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Approuvé' },
  APPROUVEE: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Approuvé' },
  REJECTED: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Rejeté' },
  REJETE: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Rejeté' },
  REJETEE: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Rejeté' },
};

const TYPE_BADGE_MAP = {
  DEPOT: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Dépôt' },
  RETRAIT: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Retrait' },
  INITIALISATION: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Initialisation' },
  INITIALIZATION: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Initialisation' },
  VENTE: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Vente' },
  RETOUR: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Retour' },
  ACTIF: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Actif' },
  VIREMENTDROIT: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Virement de droit' },
};

const MOVEMENT_BADGE_MAP = {
  ACTIF: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Actif' },
  PASSIF: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Passif' },
};

// Statuts des appels d'offres — mêmes teintes sémantiques que le reste
// (orange = attente, violet = attribué/marque, rouge = annulé, emerald = ouvert, blue = dépouillé)
const TENDER_STATUS_BADGE_MAP = {
  OUVERT: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Ouvert' },
  ENATTENTE: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'En attente' },
  DEPOUILLE: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Dépouillé' },
  ATTRIBUE: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Attribué' },
  ANNULE: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Annulé' },
  RETENUE: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Retenue' },
  SOUMIS: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Soumis' },
  NONRETENUE: { className: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: 'Non retenue' },
};

export function getTransactionStatusBadgeProps(status, options = {}) {
  if (options?.isValide) status = TransactionStatus.APPROVED;
  const key = normalizeKey(status);
  return STATUS_BADGE_MAP[key] || { className: DEFAULT_BADGE.className, label: status || DEFAULT_BADGE.label };
}

export function getTransactionTypeBadgeProps(type) {
  const key = normalizeKey(type);
  return TYPE_BADGE_MAP[key] || { className: DEFAULT_BADGE.className, label: type || DEFAULT_BADGE.label };
}

export function getMovementTypeBadgeProps(mvType) {
  const key = normalizeKey(mvType);
  // Un mouvement ACTIF/PASSIF partage les couleurs du type du même nom
  return (
    MOVEMENT_BADGE_MAP[key] ||
    TYPE_BADGE_MAP[key] || { className: DEFAULT_BADGE.className, label: mvType || DEFAULT_BADGE.label }
  );
}

export function getTenderStatusBadgeProps(status) {
  const key = normalizeKey(status);
  return TENDER_STATUS_BADGE_MAP[key] || { className: DEFAULT_BADGE.className, label: status ? String(status).replace(/_/g, ' ') : DEFAULT_BADGE.label };
}

// Version plurielle : gère un statut string ou un tableau de statuts
// (un actif peut mélanger APPROVED + PENDING -> "Approuvé partiellement")
export function getTransactionStatusBadges(statut) {
  const arr = Array.isArray(statut) ? statut : (statut == null ? [] : [statut]);
  if (arr.length === 0) {
    return [{ className: DEFAULT_BADGE.className, label: DEFAULT_BADGE.label }];
  }
  const upper = arr.map((s) => normalizeKey(s));
  const hasApproved = upper.some((s) => s.includes('APPROVED') || s.includes('APPROUVE'));
  const hasPending = upper.some((s) => s.includes('PENDING') || s.includes('ATTENTE'));
  if (hasApproved && hasPending) {
    return [{ className: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Approuvé partiellement' }];
  }
  return arr.map((s) => getTransactionStatusBadgeProps(s));
}
