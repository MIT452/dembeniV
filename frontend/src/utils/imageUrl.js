/**
 * Construit l'URL complète d'une image stockée en base de données.
 *
 * - Si l'image est une URL absolue (Cloudinary, https://...) → retournée telle quelle.
 * - Si l'image est un chemin local (/public/uploads/...) → préfixée avec VITE_API_URL.
 * - Si l'image est vide ou null → retourne le fallback fourni.
 *
 * @param {string|null} imagePath - Le chemin ou URL de l'image depuis la DB.
 * @param {string} [fallback=''] - URL de secours si l'image est vide.
 * @returns {string}
 */
export const getImageUrl = (imagePath, fallback = '') => {
    if (!imagePath) return fallback;

    // URL absolue (Cloudinary, https, http) → retourner directement
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Chemin local relatif (/public/uploads/...) → préfixer avec l'URL du backend
    const apiBase = import.meta.env.VITE_API_URL || '';
    return `${apiBase}${imagePath}`;
};
