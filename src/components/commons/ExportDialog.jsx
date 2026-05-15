import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/dialog.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { Download, WarningOutlined } from '@mui/icons-material';

/**
 * Composant de dialogue d'export réutilisable
 * @param {boolean} isOpen - État du dialogue
 * @param {function} onClose - Fonction appelée à la fermeture
 * @param {array} formats - Formats disponibles: [{label: 'PDF', value: 'pdf'}, ...]
 * @param {function} onExport - Fonction appelée à l'export: (format) => Promise<void>
 * @param {string} title - Titre du dialogue
 * @param {boolean} isLoading - État de chargement
 */
export const ExportDialog = ({
    isOpen,
    onClose,
    formats = [],
    onExport,
    title = 'Exporter les données',
    isLoading = false
}) => {
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [error, setError] = useState(null);

    const handleExport = async () => {
        if (!selectedFormat) {
            setError('Veuillez sélectionner un format d\'export');
            return;
        }

        try {
            setError(null);
            await onExport(selectedFormat);
            setSelectedFormat(null);
            onClose();
        } catch (err) {
            setError(err.message || 'Erreur lors de l\'export');
        }
    };

    const handleClose = () => {
        setSelectedFormat(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-black font-semibold">{title}</DialogTitle>
                    <DialogDescription>
                        Sélectionnez le format d'export souhaité
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <WarningOutlined className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-2 gap-3 py-4">
                    {formats.map((format) => (
                        <button
                            key={format.value}
                            onClick={() => setSelectedFormat(format.value)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                selectedFormat === format.value
                                    ? 'border-violet-600 bg-violet-50'
                                    : 'border-gray-200 hover:border-violet-300'
                            }`}
                        >
                            <p className="font-semibold text-sm text-black">{format.label}</p>
                            <p className="text-xs text-gray-600 mt-1">{format.description}</p>
                            {selectedFormat === format.value && (
                                <Badge className="mt-2 bg-violet-600">Sélectionné</Badge>
                            )}
                        </button>
                    ))}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={!selectedFormat || isLoading}
                        className="bg-violet-600 hover:bg-violet-700"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        {isLoading ? 'Export en cours...' : 'Exporter'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExportDialog;
