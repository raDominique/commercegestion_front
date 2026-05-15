import React, { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getStatsDashboard } from '../../services/dash.service.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Alert, AlertDescription } from '../../components/ui/alert.jsx';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { ErrorOutline, TrendingUp, TrendingDown, Inventory, AccountBalanceWallet, Assessment, ArrowUpward } from '@mui/icons-material';
import { Button } from '../../components/ui/button.jsx';

const DashboardPage = () => {
    usePageTitle('Tableau de bord');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getStatsDashboard();
                setData(response.data);
            } catch (err) {
                console.error('Erreur:', err);
                setError(err.message || 'Erreur lors du chargement des statistiques');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="px-6 mx-auto">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-lg text-muted-foreground">Chargement du tableau de bord...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-6 mx-auto">
                <Alert variant="destructive">
                    <ErrorOutline className="h-4 w-4" />
                    <AlertDescription>Erreur: {error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const stats = data?.stats || {};
    const inventory = data?.inventory || {};

    return (
        <div className="px-6 mx-auto space-y-8">
            {/* En-tête avec titre et actions */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Tableau de Bord</h1>
                    <p className="text-muted-foreground mt-1">Gérez et suivez votre activité avec facilité</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Importer les données</Button>
                    <Button className="bg-violet-600 hover:bg-violet-700">+ Ajouter</Button>
                </div>
            </div>

            {/* Statistiques principales - Layout en 4 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticCard
                    title="Nombre d'Actifs"
                    value={stats.actifs}
                    icon={<Inventory className="text-emerald-600" />}
                    trend="+12%"
                    description="par rapport au mois dernier"
                />
                <StatisticCard
                    title="Nombre de Passifs"
                    value={stats.passifs}
                    icon={<TrendingDown className="text-violet-600" />}
                    trend={stats.passifs > 0 ? "+5%" : "0%"}
                    description="par rapport au mois dernier"
                />
                <StatisticCard
                    title="Retraits Effectués"
                    value={stats.retraitEffectue}
                    icon={<AccountBalanceWallet className="text-amber-600" />}
                    trend="+8%"
                    description="par rapport au mois dernier"
                />
                <StatisticCard
                    title="Dépôts Effectués"
                    value={stats.depotEffectue}
                    icon={<TrendingUp className="text-blue-600" />}
                    trend="+3%"
                    description="par rapport au mois dernier"
                />
            </div>

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Graphique Actifs par Site - Prend 2 colonnes */}
                {inventory?.charts?.actifsBySite && inventory.charts.actifsBySite.length > 0 && (
                    <Card className="border border-gray-200 bg-white lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-black font-semibold">Distribution des Actifs par Site</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={inventory.charts.actifsBySite} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="siteName" 
                                        tick={false}
                                        height={20}
                                    />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                        }}
                                        formatter={(value) => [`${value} unités`, 'Quantité']}
                                        labelStyle={{ color: '#000' }}
                                    />
                                    <Bar 
                                        dataKey="quantite" 
                                        fill="#059669" 
                                        name="Quantité"
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Inventaire Global - Prend 1 colonne */}
                <Card className="border border-gray-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg text-black font-semibold">Inventaire Global</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Total Actifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{inventory?.global?.actifs || 0}</p>
                                </div>
                                <Inventory className="text-3xl text-emerald-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Total Passifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{inventory?.global?.passifs || 0}</p>
                                </div>
                                <TrendingDown className="text-3xl text-violet-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Qté Actifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{inventory?.global?.quantiteTotaleActifs || 0}</p>
                                </div>
                                <TrendingUp className="text-3xl text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Détails par Site et Autres Statistiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Détail par Site */}
                <Card className="border border-gray-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-black font-semibold">Sites et Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                            {inventory?.charts?.actifsBySite?.map((site, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <div>
                                        <p className="font-medium text-sm text-neutral-900">{site.siteName}</p>
                                        <p className="text-xs text-gray-600">{site.total} article(s)</p>
                                    </div>
                                    <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">{site.quantite}</Badge>
                                </div>
                            ))}
                            {inventory?.charts?.actifsBySite?.length === 0 && (
                                <p className="text-gray-600 text-center py-6 text-sm">Aucun site avec actifs</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Autres Statistiques */}
                <Card className="border border-gray-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-black font-semibold">Autres Métriques</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <MetricRow label="Stocks Produits" value={stats.stocksProduits} />
                            <MetricRow label="Nombre de Sites" value={stats.nombreDeSite} />
                            <MetricRow label="Produits par Site" value={stats.nombreDeProduitsParSite} />
                            <MetricRow label="Produits Utilisables" value={stats.produitsUtilisables} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Composant pour les cartes de statistiques principales
function StatisticCard({ title, value, icon, trend, description }) {
    return (
        <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-black font-semibold">{title}</p>
                        <p className="text-4xl font-bold mt-3 text-violet-900">{value}</p>
                        <div className="flex items-center gap-1 mt-3">
                            <ArrowUpward className="text-violet-600 text-sm" />
                            <span className="text-xs font-medium text-violet-600">{trend}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{description}</p>
                    </div>
                    <div className="text-4xl opacity-80">{icon}</div>
                </div>
            </CardContent>
        </Card>
    );
}

// Composant pour les lignes de métriques
function MetricRow({ label, value }) {
    return (
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
            <p className="text-sm font-medium text-gray-700">{label}</p>
            <p className="text-2xl font-bold text-violet-900">{value}</p>
        </div>
    );
}

export default DashboardPage;
