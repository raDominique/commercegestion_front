import { useEffect } from 'react';

/**
 * Hook pour mettre à jour dynamiquement le titre de la page.
 * @param {string} title - Le titre de la page.
 */

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = `${title} | Centre de Commerce et de Gestion en Ligne`;
    }, [title]);
};

export default usePageTitle;