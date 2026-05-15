import React from 'react';
import { Button } from '../../components/ui/button.jsx';
import ExportDialog from './ExportDialog.jsx';
import { Download } from '@mui/icons-material';
import { useExport } from '../../utils/useExport.js';

/**
 * Bouton d'export réutilisable avec dialogue
 * @param {function} exportFunction - Fonction d'export à appeler
 * @param {array} formats - Formats disponibles: [{label: 'PDF', value: 'pdf', description: '...'}, ...]
 * @param {string} title - Titre du dialogue
 * @param {string} buttonLabel - Label du bouton (défaut: "Exporter")
 * @param {string} buttonVariant - Variante du bouton (défaut: "outline")
 */
export const ExportButton = ({
    exportFunction,
    formats = [],
    title = 'Exporter les données',
    buttonLabel = 'Exporter',
    buttonVariant = 'outline'
}) => {
    const { isOpen, openDialog, closeDialog, isLoading, handleExport } = useExport(exportFunction, formats);

    return (
        <>
            <Button
                variant={buttonVariant}
                onClick={openDialog}
                disabled={isLoading}
                size="sm"
            >
                <Download className="mr-2 h-4 w-4" />
                {buttonLabel}
            </Button>

            <ExportDialog
                isOpen={isOpen}
                onClose={closeDialog}
                formats={formats}
                onExport={handleExport}
                title={title}
                isLoading={isLoading}
            />
        </>
    );
};

export default ExportButton;
