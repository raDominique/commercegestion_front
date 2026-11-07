const findBackendMessage = (value, depth = 0) => {
  if (depth > 4 || value == null) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (Array.isArray(value)) {
    const messages = value.map((item) => findBackendMessage(item, depth + 1)).filter(Boolean);
    return messages.length ? messages.join(', ') : null;
  }
  if (typeof value !== 'object') return null;

  for (const key of ['message', 'messages', 'error', 'errors', 'detail']) {
    if (value[key] != null) {
      const message = findBackendMessage(value[key], depth + 1);
      if (message) return message;
    }
  }

  for (const key of ['data', 'response']) {
    if (value[key] != null) {
      const message = findBackendMessage(value[key], depth + 1);
      if (message) return message;
    }
  }

  return null;
};

export const getTransactionErrorMessage = (error, fallback) => {
  const backendMessage = findBackendMessage(error?.response?.data);
  if (backendMessage) return backendMessage;

  switch (error?.response?.status) {
    case 400:
      return 'Les données envoyées sont invalides. Vérifiez les champs et la quantité.';
    case 401:
      return 'Vous devez être connecté pour effectuer cette opération.';
    case 404:
      return 'La transaction ou la ressource demandée est introuvable.';
    default:
      return error?.message || fallback;
  }
};
