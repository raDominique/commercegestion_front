import axiosConfig from './axios.config';

/**
 * Récupère un utilisateur par son ID (GET /users/get-by-id/:id)
 * @param {string|number} userId - L'identifiant de l'utilisateur à récupérer
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function getUserById(userId) {
    if (!userId) throw new Error('userId est requis');
    const res = await axiosConfig.get(`/api/v1/users/get-by-id/${userId}`);
    return res.data;
}
/**
 * Supprime un utilisateur (DELETE /users/delete/:id)
 * @param {string|number} userId - L'identifiant de l'utilisateur à supprimer
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function deleteUser(userId) {
    if (!userId) throw new Error('userId est requis');
    const res = await axiosConfig.delete(
        `/api/v1/users/delete/${userId}`,
    );
    return res.data;
}

/**
 * Bascule le rôle d'un utilisateur (PATCH /users/toggle-role/:id)
 * @param {string|number} userId - L'identifiant de l'utilisateur à modifier
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function toggleUserRole(userId) {
    if (!userId) throw new Error('userId est requis');
    const res = await axiosConfig.patch(
        `/api/v1/users/toggle-role/${userId}`,
        {},
    );
    return res.data;
}

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
        const res = await axiosConfig.get('/api/v1/users');
        return res.data;
    }
    // Sinon, requête avec paramètres
    const res = await axiosConfig.get('/api/v1/users', { params });
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
    const res = await axiosConfig.patch(`/api/v1/users/activate/${userId}`);
    return res.data;
}

/**
 * Met à jour un utilisateur (PATCH /users/update/:id)
 * @param {string|number} userId - L'identifiant de l'utilisateur à mettre à jour
 * @param {Object} data - Les données à mettre à jour (userNickName, userPhone, avatar, etc.)
 * @param {string} token - Le token d'authentification Bearer
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function updateUser(userId, data, token) {
    if (!userId) throw new Error('userId est requis');
    if (!data) throw new Error('data est requis');
    if (!token) throw new Error('token est requis');
    const formData = new FormData();
    if (data.userNickName) formData.append('userNickName', data.userNickName);
    if (data.userPhone) formData.append('userPhone', data.userPhone);
    if (data.avatar) formData.append('avatar', data.avatar, data.avatar.name);
    // Ajoutez d'autres champs si nécessaire
    const res = await axiosConfig.patch(
        `/api/v1/users/update/${userId}`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return res.data;
}

/**
 * Récupère tous les utilisateurs au format sélection (GET /users/select/all)
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function getAllUsersSelect() {
    const res = await axiosConfig.get('/api/v1/users/select/all');
    // Retourne uniquement le tableau d'utilisateurs ou []
    return res.data?.data || [];
}

/**
 * Récupère la liste des parrains/filleuls de l'utilisateur connecté (GET /users/me/referrals)
 * @param {Object} [params] - Paramètres de pagination optionnels
 * @param {number} [params.limit=10] - Nombre de résultats par page
 * @param {number} [params.page=1] - Numéro de la page
 * @returns {Promise<Object>} Résultat de l'API contenant les informations des parrains/filleuls
 */
export async function getReferrals(params = { limit: 10, page: 1 }) {
    const res = await axiosConfig.get('/api/v1/users/me/referrals', { params });
    return res.data;
}

/**
 * Valide un parrain (POST /users/validate-parrain/:id)
 * Remarque: l'Authorization Bearer est injecté par axiosConfig si disponible
 * @param {string} userId - L'identifiant du parrain à valider
 * @returns {Promise<Object>} Résultat de l'API
 */
export async function validateViaParrain(userId) {
    if (!userId) throw new Error('userId est requis');
    const res = await axiosConfig.post(`/api/v1/users/validate-parrain/${userId}`);
    return res.data;
}