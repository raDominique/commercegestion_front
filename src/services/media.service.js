/**
 * Retourne l'URL complète d'un média (image, document, etc.) à partir d'un chemin relatif ou absolu
 * @param {string} mediaPath - Le chemin du média (ex: /upload/avatars/xxx.jpeg)
 * @returns {string} URL complète du média
 */
export function getFullMediaUrl(mediaPath) {
    if (!mediaPath) return '';
    const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
    if (mediaPath.startsWith('http')) return mediaPath;
    return base + mediaPath;
}