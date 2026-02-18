import axiosConfig from './axios.config';

/**
 * Récupère la liste des utilisateurs (GET /users)
 * @param {Object} [params] - Paramètres de recherche optionnels
 * @param {boolean} [params.isVerified]
 * @param {boolean} [params.isActive]
 * @param {string} [params.userType]
 * @param {string} [params.search]
 * @param {number} [params.limit]
 * @param {number} [params.page]
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function getUsers(params = {}) {
    // Si aucun paramètre, requête simple
    if (!params || Object.keys(params).length === 0) {
        const res = await axiosConfig.get('/users');
        return res.data;
    }
    // Sinon, requête avec paramètres
    const res = await axiosConfig.get('/users', { params });
    return res.data;
}

// Exemple d'utilisation :
// getUsers({ isVerified: true, isActive: true, userType: 'Particulier', search: 'q', limit: 10, page: 1 })
// getUsers()

/**
 * Active un utilisateur par son ID (PATCH /users/activate/:id)
 * @param {string|number} userId - L'identifiant de l'utilisateur à activer
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function activateUser(userId) {
    if (!userId) throw new Error('userId est requis');
    const res = await axiosConfig.patch(`/users/activate/${userId}`);
    return res.data;
}