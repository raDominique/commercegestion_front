import axiosInstance from './axios.config.js';

/**
 * Export users data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportUsers = async (format = 'pdf') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/users/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export en ${format}:`, err);
    throw err;
  }
};

/**
 * Download exported file to user's device
 * @param {Blob} fileBlob - The file blob to download
 * @param {string} filename - The filename for the downloaded file
 */
export const downloadFile = (fileBlob, filename) => {
  try {
    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err);
    throw err;
  }
};

/**
 * Export and download users data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadUsers = async (format = 'pdf') => {
  try {
    const fileBlob = await exportUsers(format);
    const filename = `utilisateurs_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement:', err);
    throw err;
  }
};

/**
 * Export audit data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportAudit = async (format = 'excel') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/audit/audit/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export audit en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download audit data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadAudit = async (format = 'excel') => {
  try {
    const fileBlob = await exportAudit(format);
    const filename = `audit_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement audit:', err);
    throw err;
  }
};

/**
 * Export sites data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportSites = async (format = 'excel') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/sites/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export sites en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download sites data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadSites = async (format = 'excel') => {
  try {
    const fileBlob = await exportSites(format);
    const filename = `sites_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement sites:', err);
    throw err;
  }
};

/**
 * Export products data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportProducts = async (format = 'excel') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/products/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export produits en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download products data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadProducts = async (format = 'excel') => {
  try {
    const fileBlob = await exportProducts(format);
    const filename = `produits_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement produits:', err);
    throw err;
  }
};

/**
 * Export CPC data in CSV format
 * @returns {Promise<Blob>} - The exported file as Blob (CSV)
 */
export const exportCPC = async () => {
  try {
    const response = await axiosInstance.get(
      `/api/v1/cpc/export`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error('Erreur lors de l\'export CPC:', err);
    throw err;
  }
};

/**
 * Export and download CPC data
 */
export const exportAndDownloadCPC = async () => {
  try {
    const fileBlob = await exportCPC();
    const filename = `cpc_${new Date().getTime()}.csv`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement CPC:', err);
    throw err;
  }
};

/**
 * Export stocks data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportStocks = async (format = 'excel') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/stocks/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export stocks en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download stocks data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadStocks = async (format = 'excel') => {
  try {
    const fileBlob = await exportStocks(format);
    const filename = `stocks_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement stocks:', err);
    throw err;
  }
};

/**
 * Export actifs data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportActifs = async (format = 'excel') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/actifs/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export actifs en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download actifs data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadActifs = async (format = 'excel') => {
  try {
    const fileBlob = await exportActifs(format);
    const filename = `actifs_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement actifs:', err);
    throw err;
  }
};

/**
 * Export passifs data in the specified format
 * @param {string} format - Export format: 'pdf' or 'excel'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportPassifs = async (format = 'excel') => {
  try {
    if (!['pdf', 'excel'].includes(format)) {
      throw new Error('Format must be either "pdf" or "excel"');
    }

    const response = await axiosInstance.get(
      `/api/v1/passifs/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export passifs en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download passifs data
 * @param {string} format - Export format: 'pdf' or 'excel'
 */
export const exportAndDownloadPassifs = async (format = 'excel') => {
  try {
    const fileBlob = await exportPassifs(format);
    const filename = `passifs_${new Date().getTime()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement passifs:', err);
    throw err;
  }
};

/**
 * Export user transactions data in the specified format
 * @param {string} userId - The ID of the user
 * @param {string} format - Export format: 'csv', 'excel', or 'pdf'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportUserTransactions = async (userId, format = 'excel') => {
  try {
    if (!['csv', 'excel', 'pdf'].includes(format)) {
      throw new Error('Format must be one of: "csv", "excel", or "pdf"');
    }

    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await axiosInstance.get(
      `/api/v1/transactions/user/${userId}/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export transactions en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download user transactions data
 * @param {string} userId - The ID of the user
 * @param {string} format - Export format: 'csv', 'excel', or 'pdf'
 */
export const exportAndDownloadUserTransactions = async (userId, format = 'excel') => {
  try {
    const fileBlob = await exportUserTransactions(userId, format);
    const fileExtension = format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `transactions_${new Date().getTime()}.${fileExtension}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement transactions:', err);
    throw err;
  }
};

/**
 * Export user ledger data in the specified format
 * @param {string} userId - The ID of the user
 * @param {string} format - Export format: 'csv', 'excel', or 'pdf'
 * @returns {Promise<Blob>} - The exported file as Blob
 */
export const exportUserLedger = async (userId, format = 'csv') => {
  try {
    if (!['csv', 'excel', 'pdf'].includes(format)) {
      throw new Error('Format must be one of: "csv", "excel", or "pdf"');
    }

    if (!userId) {
      throw new Error('userId is required');
    }

    const response = await axiosInstance.get(
      `/api/v1/ledger/user/${userId}/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (err) {
    console.error(`Erreur lors de l'export ledger en ${format}:`, err);
    throw err;
  }
};

/**
 * Export and download user ledger data
 * @param {string} userId - The ID of the user
 * @param {string} format - Export format: 'csv', 'excel', or 'pdf'
 */
export const exportAndDownloadUserLedger = async (userId, format = 'csv') => {
  try {
    const fileBlob = await exportUserLedger(userId, format);
    const fileExtension = format === 'csv' ? 'csv' : format === 'pdf' ? 'pdf' : 'xlsx';
    const filename = `ledger_${new Date().getTime()}.${fileExtension}`;
    downloadFile(fileBlob, filename);
  } catch (err) {
    console.error('Erreur lors de l\'export et téléchargement ledger:', err);
    throw err;
  }
};
