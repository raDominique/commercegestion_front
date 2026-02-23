// useDateFormat.jsx
// Hook utilitaire pour formater les dates backend en "le 23/02/2026 à 07:36"
import { useCallback } from 'react';

/**
 * Formate une date ISO en "le jj/mm/aaaa à hh:mm"
 * @param {string|Date} dateStr - La date à formater
 * @returns {string} - Date formatée
 */
export default function useDateFormat() {
  return useCallback((dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `le ${day}/${month}/${year} à ${hours}:${minutes}`;
  }, []);
}
