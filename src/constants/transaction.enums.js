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
  APPROVED: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Approuvée' },
  REJECTED: { className: 'bg-red-50 text-red-700 border-red-200', label: 'Rejetée' },
};

const TYPE_BADGE_MAP = {
  DEPOT: { className: 'bg-violet-50 text-violet-700 border-violet-200', label: TransactionType.DEPOT },
  RETRAIT: { className: 'bg-red-50 text-red-700 border-red-200', label: TransactionType.RETRAIT },
  INITIALISATION: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: TransactionType.INITIALISATION },
  VENTE: { className: 'bg-orange-50 text-orange-700 border-orange-200', label: TransactionType.VENTE },
  // Additional / legacy types often seen in the app
  RETOUR: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: 'RETOUR' },
};

const MOVEMENT_BADGE_MAP = {
  ACTIF: { className: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: MovementType.ACTIF },
  PASSIF: { className: 'bg-blue-50 text-blue-700 border-blue-200', label: MovementType.PASSIF },
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
  return MOVEMENT_BADGE_MAP[key] || { className: DEFAULT_BADGE.className, label: mvType || DEFAULT_BADGE.label };
}
