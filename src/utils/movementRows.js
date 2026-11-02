const getRelationId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return String(value._id || value.id || value.userId || value.siteId || '');
};

const getMovementDimension = (item, candidates) => {
  for (const candidate of candidates) {
    const id = getRelationId(item?.[candidate]);
    if (id) return id;
  }
  return '';
};

export const deduplicateMovementRows = (rows, getQuantity) => {
  const seen = new Set();
  return (Array.isArray(rows) ? rows : []).filter((item) => {
    if (getQuantity) {
      const quantity = Number(getQuantity(item));
      if (!Number.isFinite(quantity) || quantity <= 0) return false;
    }

    const dimensions = [
      getMovementDimension(item, ['productId', 'product', 'produit']),
      getMovementDimension(item, ['depotId', 'siteId', 'siteDestinationId', 'siteOrigineId']),
      getMovementDimension(item, ['detentaireId', 'detentaire', 'holderId']),
      getMovementDimension(item, ['ayantDroitId', 'ayant_droit', 'ayantDroit', 'beneficiaryId']),
    ];

    if (dimensions.some((value) => !value)) return true;

    const key = dimensions.join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getRelationIdForDisplay = getRelationId;
