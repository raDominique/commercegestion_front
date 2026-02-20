import axiosInstance from "./axios.config";

// Service to fetch CPC data from the API
// Service to fetch CPC data from the API with query parameters
export const getCpc = async ({ search = '', niveau = '', limit = '', page = '' } = {}) => {
    try {
        const params = {};
        if (search) params.search = search;
        if (niveau) params.niveau = niveau;
        if (limit) params.limit = limit;
        if (page) params.page = page;
        const response = await axiosInstance.get("/api/v1/cpc", { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Service to get CPC by code
export const getCpcByCode = async (code) => {
    try {
        const response = await axiosInstance.get(`/api/v1/cpc/get-by-code/${code}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

/**
 * Crée un nouveau code CPC
 * @param {Object} cpcData - Les données du CPC à créer
 * @param {string} token - Le token d'authentification
 * @return {Promise} - Une promesse qui résout la réponse de l'API
 */
export const createCpc = async (cpcData, token) => {
    try {
        // Structure attendue par l'API
        const data = {
            code: cpcData.code,
            nom: cpcData.nom,
            niveau: cpcData.niveau,
            parentCode: cpcData.parentCode,
            ancetres: Array.isArray(cpcData.ancetres) ? cpcData.ancetres : [],
            correspondances: cpcData.correspondances || {},
        };
        const response = await axiosInstance.post(
            "/api/v1/cpc",
            data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'accept': '*/*',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Service to update a CPC by code (id)
export const updateCpc = async (code, cpcData, token) => {
    try {
        const data = {
            code: cpcData.code,
            nom: cpcData.nom,
            niveau: cpcData.niveau,
            parentCode: cpcData.parentCode,
            ancetres: Array.isArray(cpcData.ancetres) ? cpcData.ancetres : [],
            correspondances: cpcData.correspondances || {},
        };
        const response = await axiosInstance.patch(
            `/api/v1/cpc/update/${code}`,
            data,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'accept': '*/*',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Service to delete a CPC by code (id)
export const deleteCpc = async (code, token) => {
    try {
        const response = await axiosInstance.delete(
            `/api/v1/cpc/delete/${code}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*',
                },
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};
