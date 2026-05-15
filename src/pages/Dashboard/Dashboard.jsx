import React, { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getStatsDashboard } from '../../services/dash.service.js';
import { useAuth } from '../../context/AuthContext.jsx';
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
import { ErrorOutline, TrendingUp, TrendingDown, Inventory, AccountBalanceWallet, Assessment, ArrowUpward, Groups, LocationCity } from '@mui/icons-material';
import { Button } from '../../components/ui/button.jsx';

const DashboardPage = () => {
    usePageTitle('Tableau de bord');
    const { user } = useAuth();
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
    const isAdmin = user?.userAccess === 'Admin';

    return (
        <div className="px-6 mx-auto space-y-8">
            {/* En-tête avec titre et actions */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900">Tableau de Bord</h1>
                    <p className="text-muted-foreground mt-1">Gérez et suivez votre activité avec facilité</p>
                </div>
            </div>

            {/* Statistiques principales - Layout en 4 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticCard
                    title="Nombre d'Actifs"
                    value={stats.actifs || 0}
                    icon={<Inventory className="text-violet-600" />}
                    description="Vos actifs"
                />
                <StatisticCard
                    title="Nombre de Passifs"
                    value={stats.passifs || 0}
                    icon={<TrendingDown className="text-violet-600" />}
                    description="Vos passifs"
                />
                <StatisticCard
                    title="Retraits Effectués"
                    value={stats.retraitEffectue || 0}
                    icon={<AccountBalanceWallet className="text-violet-600" />}
                    description="Retraits"
                />
                <StatisticCard
                    title="Dépôts Effectués"
                    value={stats.depotEffectue || 0}
                    icon={<TrendingUp className="text-blue-600" />}
                    description="Dépôts"
                />
            </div>

            {/* Statistiques Admin - visible uniquement pour les admins */}
            {isAdmin && stats.admin && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    <StatisticCard
                        title="Total Sites"
                        value={stats.admin.totalSites || 0}
                        icon={<LocationCity className="text-emerald-600" />}
                    />
                    <StatisticCard
                        title="Total Utilisateurs"
                        value={stats.admin.totalUsers || 0}
                        icon={<Groups className="text-blue-600" />}
                    />
                    <StatisticCard
                        title="Total Actifs"
                        value={stats.admin.totalAssets || 0}
                        icon={<Inventory className="text-amber-600" />}
                    />
                    <StatisticCard
                        title="Total Passifs"
                        value={stats.admin.totalLiabilities || 0}
                        icon={<TrendingDown className="text-red-600" />}
                    />
                    <StatisticCard
                        title="Total Transactions"
                        value={stats.admin.totalTransactions || 0}
                        icon={<Assessment className="text-purple-600" />}
                    />
                    <StatisticCard
                        title="Total Produits"
                        value={stats.admin.totalProducts || 0}
                        icon={<Inventory className="text-indigo-600" />}
                    />
                </div>
            )}

            {/* Section Graphiques - 6 Charts */}
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-6">Graphiques & Analyses</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Chart 1: Actifs par Site */}
                    <ChartCard
                        title="Distribution des Actifs par Site"
                        data={inventory?.charts?.actifsBySite}
                        dataKey="total"
                        xAxisKey="siteName"
                        transformData={(data) => data
                            .filter(site => site.total > 0 || site._id !== null)
                            .map(site => ({
                                ...site,
                                siteName: site._id || 'Sans site'
                            }))
                        }
                    />

                    {/* Chart 2: Passifs par Site */}
                    <ChartCard
                        title="Distribution des Passifs par Site"
                        data={inventory?.charts?.passifsBySite}
                        dataKey="total"
                        xAxisKey="siteName"
                        transformData={(data) => data
                            .filter(site => site.total > 0 || site._id !== null)
                            .map(site => ({
                                ...site,
                                siteName: site._id || 'Sans site'
                            }))
                        }
                    />

                    {/* Chart 3: Actifs par Produit */}
                    <ChartCard
                        title="Distribution des Actifs par Produit"
                        data={inventory?.charts?.actifsByProduct}
                        dataKey="total"
                        xAxisKey="productName"
                        transformData={(data) => data
                            .filter(product => product.total > 0 || product._id !== null)
                            .map(product => ({
                                ...product,
                                productName: product._id?.substring(0, 8) || 'Sans produit'
                            }))
                        }
                    />

                    {/* Chart 4: Passifs par Produit */}
                    <ChartCard
                        title="Distribution des Passifs par Produit"
                        data={inventory?.charts?.passifsByProduct}
                        dataKey="total"
                        xAxisKey="productName"
                        transformData={(data) => data
                            .filter(product => product.total > 0 || product._id !== null)
                            .map(product => ({
                                ...product,
                                productName: product._id?.substring(0, 8) || 'Sans produit'
                            }))
                        }
                    />

                    {/* Chart 5: Transactions par Mois */}
                    <ChartCard
                        title="Transactions par Mois"
                        data={inventory?.charts?.transactionsByMonth}
                        dataKey="count"
                        xAxisKey="month"
                        transformData={(data) => data.map(item => ({
                            month: `${item._id?.month}/${item._id?.year}`,
                            count: item.count
                        }))}
                    />

                    {/* Chart 6: Transactions par Semaine */}
                    <ChartCard
                        title="Transactions par Semaine"
                        data={inventory?.charts?.transactionsByWeek}
                        dataKey="count"
                        xAxisKey="week"
                        transformData={(data) => data.map(item => ({
                            week: `S${item._id?.week} - 2026`,
                            count: item.count
                        }))}
                    />
                </div>
            </div>

            {/* Inventaire Global et Détails */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inventaire Global - Prend 1 colonne */}
                <Card className="border border-gray-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg text-black font-semibold">Inventaire Global</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Quantité Actifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{inventory?.global?.quantiteTotaleActifs || 0}</p>
                                </div>
                                <Inventory className="text-3xl text-violet-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Quantité Passifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{inventory?.global?.quantiteTotalePassifs || 0}</p>
                                </div>
                                <TrendingDown className="text-3xl text-violet-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Nombre Actifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{inventory?.global?.actifs || 0}</p>
                                </div>
                                <TrendingUp className="text-3xl text-violet-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Détail par Site */}
                <Card className="border border-gray-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-black font-semibold">Sites et Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-72 overflow-y-auto">
                            {inventory?.charts?.actifsBySite?.filter(site => site._id !== null).length > 0 ? (
                                inventory?.charts?.actifsBySite
                                    ?.filter(site => site._id !== null)
                                    ?.map((site, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div>
                                                <p className="font-medium text-sm text-neutral-900">{site._id || 'Sans site'}</p>
                                                <p className="text-xs text-gray-600">{site.total || 0} élément(s)</p>
                                            </div>
                                            <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100">{site.total || 0}</Badge>
                                        </div>
                                    ))
                            ) : (
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
                            <MetricRow label="Stocks Produits" value={stats.stocksProduits || 0} />
                            <MetricRow label="Nombre de Sites" value={stats.nombreDeSite || 0} />
                            <MetricRow label="Produits par Site" value={stats.nombreDeProduitsParSite || 0} />
                            <MetricRow label="Produits Utilisables" value={stats.produitsUtilisables || 0} />
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
                        {trend && (
                            <div className="flex items-center gap-1 mt-3">
                                <ArrowUpward className="text-violet-600 text-sm" />
                                <span className="text-xs font-medium text-violet-600">{trend}</span>
                            </div>
                        )}
                        {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
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

// Composant réutilisable pour les charts
function ChartCard({ title, data, dataKey, xAxisKey, transformData }) {
    if (!data || data.length === 0) {
        return (
            <Card className="border border-gray-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-black font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-80 text-gray-500">
                        <p>Aucune donnée disponible</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const chartData = transformData ? transformData(data) : data.map(item => ({
        ...item,
        [xAxisKey]: item._id || 'Sans donnée'
    }));

    if (chartData.filter(item => item[dataKey] > 0).length === 0) {
        return (
            <Card className="border border-gray-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-black font-semibold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-80 text-gray-500">
                        <p>Aucune donnée disponible</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-200 bg-white">
            <CardHeader>
                <CardTitle className="text-black font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                            dataKey={xAxisKey} 
                            tick={{ fontSize: 11 }}
                            height={70}
                            angle={-45}
                            textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip 
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [`${value}`, 'Nombre']}
                            labelStyle={{ color: '#000' }}
                        />
                        <Bar 
                            dataKey={dataKey} 
                            fill="#7c3aed" 
                            name="Total"
                            radius={[8, 8, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default DashboardPage;
