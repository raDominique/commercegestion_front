import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personnalisé pour gérer les exports avec dialog
 * @param {function} exportFunction - Fonction d'export à appeler
 * @param {array} availableFormats - Formats disponibles
 * @returns {object} - { isOpen, openDialog, closeDialog, isLoading, formats }
 */
export const useExport = (exportFunction, availableFormats = []) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();

    const handleExport = async (format) => {
        setIsLoading(true);
        try {
            // Si la fonction d'export nécessite un userId, on le passe
            if (exportFunction.length > 1) {
                await exportFunction(user?.userId || user?.id, format);
            } else {
                await exportFunction(format);
            }
        } catch (error) {
            throw new Error(error.message || 'Erreur lors de l\'export');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isOpen,
        openDialog: () => setIsOpen(true),
        closeDialog: () => setIsOpen(false),
        isLoading,
        handleExport,
        formats: availableFormats,
        userId: user?.userId || user?.id
    };
};

export default useExport;
