// utils/formatNumber.js
// Fonction utilitaire pour formater un nombre avec des séparateurs de milliers

/**
 * Formate un nombre avec des séparateurs de milliers (espace insécable par défaut)
 * @param {number|string} value - Le nombre à formater
 * @param {string} [separator=' '] - Le séparateur à utiliser (par défaut espace insécable)
 * @returns {string}
 */
export function formatThousands(value, separator = ' ') {
    if (value === null || value === undefined || value === '') return '';
    const num = typeof value === 'number' ? value : Number(String(value).replace(/\s/g, ''));
    if (isNaN(num)) return '';
    // Utilise l'API Intl si disponible
    if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
        return new Intl.NumberFormat('fr-FR').format(num);
    }
    // Fallback simple
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}
