import React from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { useAuth } from '../../context/AuthContext';
import ExportButton from '../../components/commons/ExportButton.jsx';
import {
    exportAndDownloadUsers,
    exportAndDownloadAudit,
    exportAndDownloadSites,
    exportAndDownloadProducts,
    exportAndDownloadCPC,
    exportAndDownloadStocks,
    exportAndDownloadActifs,
    exportAndDownloadPassifs,
    exportAndDownloadUserTransactions,
    exportAndDownloadUserLedger
} from '../../services/export.service.js';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import { FileDownload, Info } from '@mui/icons-material';

const ExportHub = () => {
    usePageTitle('Centre d\'Export');
    const { user } = useAuth();

    const isAdmin = user?.userAccess === 'Admin';

    // Formats standards
    const pdfExcelFormats = [
        { label: 'PDF', value: 'pdf', description: 'Document PDF' },
        { label: 'Excel', value: 'excel', description: 'Fichier Excel (.xlsx)' }
    ];

    const allFormats = [
        { label: 'CSV', value: 'csv', description: 'Fichier CSV' },
        { label: 'Excel', value: 'excel', description: 'Fichier Excel (.xlsx)' },
        { label: 'PDF', value: 'pdf', description: 'Document PDF' }
    ];

    const csvOnlyFormats = [
        { label: 'CSV', value: 'csv', description: 'Fichier CSV' }
    ];

    return (
        <div className="px-6 mx-auto space-y-8">
            {/* En-tête */}
            <div>
                <h1 className="text-3xl font-bold text-neutral-900">Centre d'Export</h1>
                <p className="text-muted-foreground mt-1">Exportez vos données dans le format souhaité</p>
            </div>

            {/* Info alert */}
            <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                    Sélectionnez le format d'export souhaité. Certains exports nécessitent une authentification.
                </AlertDescription>
            </Alert>

            {/* Section Admin - visible uniquement pour les admins */}
            {isAdmin && (
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-4">Exports Administrateur</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Utilisateurs */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                    <FileDownload className="text-blue-600" />
                                    Utilisateurs
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Exporter la liste complète des utilisateurs du système
                                </p>
                                <ExportButton
                                    exportFunction={exportAndDownloadUsers}
                                    formats={pdfExcelFormats}
                                    title="Exporter les utilisateurs"
                                    buttonLabel="Exporter"
                                    buttonVariant="default"
                                />
                            </CardContent>
                        </Card>

                        {/* Audit */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                    <FileDownload className="text-purple-600" />
                                    Audit
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Exporter les logs d'audit du système
                                </p>
                                <ExportButton
                                    exportFunction={exportAndDownloadAudit}
                                    formats={pdfExcelFormats}
                                    title="Exporter l'audit"
                                    buttonLabel="Exporter"
                                    buttonVariant="default"
                                />
                            </CardContent>
                        </Card>

                        {/* Sites */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                    <FileDownload className="text-green-600" />
                                    Sites
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Exporter la liste complète des sites
                                </p>
                                <ExportButton
                                    exportFunction={exportAndDownloadSites}
                                    formats={pdfExcelFormats}
                                    title="Exporter les sites"
                                    buttonLabel="Exporter"
                                    buttonVariant="default"
                                />
                            </CardContent>
                        </Card>

                        {/* Produits */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                    <FileDownload className="text-amber-600" />
                                    Produits
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Exporter le catalogue complet des produits
                                </p>
                                <ExportButton
                                    exportFunction={exportAndDownloadProducts}
                                    formats={pdfExcelFormats}
                                    title="Exporter les produits"
                                    buttonLabel="Exporter"
                                    buttonVariant="default"
                                />
                            </CardContent>
                        </Card>

                        {/* CPC */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                    <FileDownload className="text-red-600" />
                                    CPC
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Exporter les données CPC
                                </p>
                                <ExportButton
                                    exportFunction={exportAndDownloadCPC}
                                    formats={csvOnlyFormats}
                                    title="Exporter CPC"
                                    buttonLabel="Exporter"
                                    buttonVariant="default"
                                />
                            </CardContent>
                        </Card>

                        {/* Stocks */}
                        <Card className="border border-gray-200 bg-white">
                            <CardHeader>
                                <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                    <FileDownload className="text-indigo-600" />
                                    Stocks
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">
                                    Exporter les mouvements de stocks
                                </p>
                                <ExportButton
                                    exportFunction={exportAndDownloadStocks}
                                    formats={pdfExcelFormats}
                                    title="Exporter les stocks"
                                    buttonLabel="Exporter"
                                    buttonVariant="default"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Section Utilisateur - visible pour tous */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Mes Exports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Actifs */}
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                <FileDownload className="text-violet-600" />
                                Mes Actifs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Exporter votre liste personnelle d'actifs
                            </p>
                            <ExportButton
                                exportFunction={exportAndDownloadActifs}
                                formats={pdfExcelFormats}
                                title="Exporter mes actifs"
                                buttonLabel="Exporter"
                                buttonVariant="default"
                            />
                        </CardContent>
                    </Card>

                    {/* Passifs */}
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                <FileDownload className="text-red-600" />
                                Mes Passifs
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Exporter votre liste personnelle de passifs
                            </p>
                            <ExportButton
                                exportFunction={exportAndDownloadPassifs}
                                formats={pdfExcelFormats}
                                title="Exporter mes passifs"
                                buttonLabel="Exporter"
                                buttonVariant="default"
                            />
                        </CardContent>
                    </Card>

                    {/* Transactions */}
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                <FileDownload className="text-emerald-600" />
                                Mes Transactions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Exporter votre historique de transactions
                            </p>
                            <ExportButton
                                exportFunction={exportAndDownloadUserTransactions}
                                formats={allFormats}
                                title="Exporter mes transactions"
                                buttonLabel="Exporter"
                                buttonVariant="default"
                            />
                        </CardContent>
                    </Card>

                    {/* Ledger */}
                    <Card className="border border-gray-200 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg text-black font-semibold flex items-center gap-2">
                                <FileDownload className="text-orange-600" />
                                Mon Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                Exporter votre grand livre comptable
                            </p>
                            <ExportButton
                                exportFunction={exportAndDownloadUserLedger}
                                formats={allFormats}
                                title="Exporter mon ledger"
                                buttonLabel="Exporter"
                                buttonVariant="default"
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ExportHub;
