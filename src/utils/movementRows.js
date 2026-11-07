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
      getMovementDimension(item, ['userId', 'debtorId', 'debtor']),
      String(item?.role || '').trim().toUpperCase(),
    ];

    if (dimensions.some((value) => !value)) return true;

    const key = dimensions.join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const getRelationIdForDisplay = getRelationId;

export const classifyPassifRows = (rows, currentUserId, getQuantity) => {
  const userId = getRelationId(currentUserId);
  const uniqueRows = deduplicateMovementRows(rows, getQuantity);
  const result = { debtorRows: [], claimRows: [], unclassifiedRows: [], incompleteRows: [] };

  uniqueRows.forEach((item) => {
    const role = String(item?.role || '').trim().toUpperCase();
    let category;

    if (role === 'DEBITEUR') {
      category = 'debtorRows';
    } else if (role === 'CREANCIER') {
      category = 'claimRows';
    } else if (userId) {
      const debtorId = getRelationId(item?.userId || item?.debtorId || item?.debtor);
      const beneficiaryId = getRelationId(
        item?.ayantDroitId || item?.ayant_droit || item?.ayantDroit || item?.beneficiaryId
      );

      if ((!role || role === 'DEBITEUR') && debtorId === userId) {
        category = 'debtorRows';
      } else if ((!role || role === 'CREANCIER') && beneficiaryId === userId) {
        category = 'claimRows';
      }
    }

    const hasHolderId = Boolean(getRelationId(item?.detentaireId || item?.detentaire || item?.holderId));
    const hasBeneficiaryId = Boolean(
      getRelationId(item?.ayantDroitId || item?.ayant_droit || item?.ayantDroit || item?.beneficiaryId)
    );
    const hasDebtorId = Boolean(getRelationId(item?.userId || item?.debtorId || item?.debtor));
    if (!hasHolderId || !hasBeneficiaryId || !hasDebtorId) {
      result.incompleteRows.push(item);
    }

    if (category) {
      result[category].push({ ...item, displayRole: category === 'debtorRows' ? 'DEBITEUR' : 'CREANCIER' });
    } else {
      result.unclassifiedRows.push(item);
    }
  });

  return result;
};

export const sumMovementQuantities = (rows, getQuantity) => (
  (Array.isArray(rows) ? rows : []).reduce((total, item) => {
    const quantity = Number(getQuantity(item));
    return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 0);
  }, 0)
);

export const extractLedgerRows = (response) => {
  const candidates = [
    response,
    response?.data,
    response?.items,
    response?.results,
    response?.data?.data,
    response?.data?.items,
    response?.data?.results,
  ];
  return candidates.find(Array.isArray) || [];
};

const getLedgerRowCount = (response) => {
  const candidates = [
    response?.total,
    response?.pagination?.total,
    response?.data?.total,
    response?.data?.pagination?.total,
    response?.data?.meta?.total,
  ];
  const total = candidates.find((value) => value != null && Number.isFinite(Number(value)));
  return total == null ? null : Number(total);
};

export const fetchAllLedgerPages = async (fetchPage, userId, params = {}) => {
  const limit = 100;
  const rows = [];
  const seenPages = new Set();
  let page = 1;

  while (true) {
    const response = await fetchPage(userId, { ...params, page, limit });
    const pageRows = extractLedgerRows(response);
    if (pageRows.length === 0) break;

    const signature = pageRows
      .map((item) => String(item?._id || item?.id || JSON.stringify(item)))
      .join('|');
    if (seenPages.has(signature)) {
      throw new Error('L’API a renvoyé une page de mouvements déjà reçue.');
    }
    seenPages.add(signature);
    rows.push(...pageRows);

    const total = getLedgerRowCount(response);
    if (total != null ? page * limit >= total : pageRows.length < limit) break;
    page += 1;
  }

  return rows;
};
