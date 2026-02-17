import { useEffect } from 'react';

/**
 * Hook pour mettre à jour dynamiquement le titre de la page.
 * @param {string} title - Le titre de la page.
 */

const usePageTitle = (title) => {
    useEffect(() => {
        document.title = `${title} | Etokisana`;
    }, [title]);
};

export default usePageTitle;