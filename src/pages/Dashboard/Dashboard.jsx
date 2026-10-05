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
    Legend,
} from 'recharts';
import { ErrorOutline, TrendingUp, TrendingDown, Inventory, AccountBalanceWallet, Assessment, ArrowUpward, Groups, LocationCity } from '@mui/icons-material';
import { Loader } from '../../components/ui/loader';

// Formatage des nombres avec séparateurs de milliers (fr-FR)
const formatNumber = (value) => new Intl.NumberFormat('fr-FR').format(value ?? 0);

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// Tronque un label long pour l'axe X (le tooltip affiche le nom complet)
const truncate = (str, max = 22) => (str?.length > max ? `${str.slice(0, max)}…` : str || '');

const DashboardPage = () => {
    usePageTitle('Tableau de bord');
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [transactionsMode, setTransactionsMode] = useState('count'); // 'count' | 'quantite'

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
        return <div className="flex items-center justify-center h-screen"><Loader message="Chargement du tableau de bord..." /></div>;
    }

    if (error) {
        return (
            <div className="px-4 md:px-6 mx-auto">
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
        <div className="px-4 md:px-6 mx-auto space-y-8">
            {/* En-tête avec titre et actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl text-neutral-900 mb-2">Tableau de bord</h1>
                    <p className="text-sm text-neutral-600">Vue d'ensemble de votre activité</p>
                </div>
            </div>

            {/* Statistiques principales - Layout en 4 colonnes : nombre + quantité */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatisticCard
                    title="Actifs"
                    value={stats.actifs || 0}
                    subtitle={`${formatNumber(stats.quantiteTotaleActifs)} en quantité totale`}
                    icon={<Inventory className="text-violet-600" />}
                    description={`${formatNumber(stats.quantiteDisponibleActifs)} dispo. · ${formatNumber(stats.quantiteEnAttenteActifs)} en attente`}
                />
                <StatisticCard
                    title="Passifs"
                    value={stats.passifs || 0}
                    subtitle={`${formatNumber(stats.quantiteTotalePassifs)} en quantité totale`}
                    icon={<TrendingDown className="text-violet-600" />}
                    description={`${formatNumber(stats.quantiteDisponiblePassifs)} dispo. · ${formatNumber(stats.quantiteEnAttentePassifs)} en attente`}
                />
                <StatisticCard
                    title="Retraits Effectués"
                    value={stats.retraitEffectue || 0}
                    subtitle={`${formatNumber(stats.quantiteRetraitEffectuee)} en quantité`}
                    icon={<AccountBalanceWallet className="text-violet-600" />}
                />
                <StatisticCard
                    title="Dépôts Effectués"
                    value={stats.depotEffectue || 0}
                    subtitle={`${formatNumber(stats.quantiteDepotEffectuee)} en quantité`}
                    icon={<TrendingUp className="text-blue-600" />}
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
                    {/* Chart 1: Actifs par Site (empilé : disponible + en attente) */}
                    <ChartCard
                        title="Actifs par Site"
                        data={inventory?.charts?.actifsBySite}
                        dataKey="disponible"
                        xAxisKey="siteName"
                        transformData={(data) => data.map(site => ({
                            ...site,
                            siteName: truncate(site.name) || 'Sans site',
                            disponible: Math.max((site.total || 0) - (site.quantiteEnAttente || 0), 0)
                        }))}
                    />

                    {/* Chart 2: Passifs par Site */}
                    <ChartCard
                        title="Passifs par Site"
                        data={inventory?.charts?.passifsBySite}
                        dataKey="disponible"
                        xAxisKey="siteName"
                        transformData={(data) => data.map(site => ({
                            ...site,
                            siteName: truncate(site.name) || 'Sans site',
                            disponible: Math.max((site.total || 0) - (site.quantiteEnAttente || 0), 0)
                        }))}
                    />

                    {/* Chart 3: Actifs par Produit */}
                    <ChartCard
                        title="Actifs par Produit"
                        data={inventory?.charts?.actifsByProduct}
                        dataKey="disponible"
                        xAxisKey="productName"
                        transformData={(data) => data.map(product => ({
                            ...product,
                            productName: truncate(product.name) || 'Sans produit',
                            disponible: Math.max((product.total || 0) - (product.quantiteEnAttente || 0), 0)
                        }))}
                    />

                    {/* Chart 4: Passifs par Produit */}
                    <ChartCard
                        title="Passifs par Produit"
                        data={inventory?.charts?.passifsByProduct}
                        dataKey="disponible"
                        xAxisKey="productName"
                        transformData={(data) => data.map(product => ({
                            ...product,
                            productName: truncate(product.name) || 'Sans produit',
                            disponible: Math.max((product.total || 0) - (product.quantiteEnAttente || 0), 0)
                        }))}
                    />

                    {/* Chart 5: Transactions par Mois - bascule Nombre / Quantité */}
                    <div className="lg:col-span-2">
                        <TransactionsChart
                            title="Transactions par Mois"
                            data={inventory?.charts?.transactionsByMonth}
                            mode={transactionsMode}
                            onModeChange={setTransactionsMode}
                            transformData={(data) => data.map(item => ({
                                name: `${MOIS_LABELS[(item._id?.month ?? 1) - 1]} ${item._id?.year ?? ''}`.trim(),
                                count: item.count || 0,
                                quantite: item.quantite || 0
                            }))}
                        />
                    </div>

                    {/* Chart 6: Transactions par Semaine */}
                    <div className="lg:col-span-2">
                        <TransactionsChart
                            title="Transactions par Semaine"
                            data={inventory?.charts?.transactionsByWeek}
                            mode={transactionsMode}
                            onModeChange={setTransactionsMode}
                            transformData={(data) => data.map(item => ({
                                name: `S${item._id?.week} - ${item._id?.year ?? ''}`.trim(),
                                count: item.count || 0,
                                quantite: item.quantity ?? item.quantite ?? 0
                            }))}
                        />
                    </div>
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
                            <div className="flex items-center justify-between p-3 bg-violet-50 border border-violet-100 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Quantité Actifs (Total)</p>
                                    <p className="text-2xl font-bold text-violet-900">{formatNumber(inventory?.global?.quantiteTotaleActifs)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatNumber(inventory?.global?.quantiteDisponibleActifs)} dispo. · {formatNumber(inventory?.global?.quantiteEnAttenteActifs)} en attente</p>
                                </div>
                                <Inventory className="text-3xl text-violet-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Quantité Passifs (Total)</p>
                                    <p className="text-2xl font-bold text-violet-900">{formatNumber(inventory?.global?.quantiteTotalePassifs)}</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatNumber(inventory?.global?.quantiteDisponiblePassifs)} dispo. · {formatNumber(inventory?.global?.quantiteEnAttentePassifs)} en attente</p>
                                </div>
                                <TrendingDown className="text-3xl text-violet-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Nombre d'Actifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{formatNumber(inventory?.global?.actifs)}</p>
                                </div>
                                <TrendingUp className="text-3xl text-violet-600" />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Nombre de Passifs</p>
                                    <p className="text-2xl font-bold text-violet-900">{formatNumber(inventory?.global?.passifs)}</p>
                                </div>
                                <TrendingDown className="text-3xl text-violet-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Détail par Site avec quantité en attente */}
                <Card className="border border-gray-200 bg-white">
                    <CardHeader>
                        <CardTitle className="text-black font-semibold">Sites et Actifs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-72 overflow-y-auto">
                            {inventory?.charts?.actifsBySite?.length > 0 ? (
                                inventory?.charts?.actifsBySite
                                    ?.map((site, index) => (
                                        <div key={site._id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="min-w-0 pr-3">
                                                <p className="font-medium text-sm text-neutral-900 truncate">{site.name || 'Sans site'}</p>
                                                <p className="text-xs text-gray-600">
                                                    {formatNumber(site.total)} · {site.quantiteEnAttente > 0 && `${formatNumber(site.quantiteEnAttente)} en attente`}
                                                </p>
                                            </div>
                                            <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-100 shrink-0">{formatNumber(site.total)}</Badge>
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
                            <MetricRow label="Stocks Produits" value={formatNumber(stats.stocksProduits)} />
                            <MetricRow label="Nombre de Sites" value={formatNumber(stats.nombreDeSite)} />
                            <MetricRow label="Produits par Site" value={formatNumber(stats.nombreDeProduitsParSite)} />
                            <MetricRow label="Produits Utilisables" value={formatNumber(stats.produitsUtilisables)} />
                            <MetricRow label="Quantité Actifs" value={formatNumber(stats.quantiteTotaleActifs)} />
                            <MetricRow label="Quantité Passifs" value={formatNumber(stats.quantiteTotalePassifs)} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Composant pour les cartes de statistiques principales
function StatisticCard({ title, value, subtitle, icon, trend, description }) {
    return (
        <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-black font-semibold">{title}</p>
                        <p className="text-2xl sm:text-4xl font-bold mt-4 text-violet-900 break-words">{value}</p>
                        {subtitle && <p className="text-sm font-medium text-violet-700 mt-1">{subtitle}</p>}
                        {trend && (
                            <div className="flex items-center gap-1 mt-2">
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
            <p className="text-sm font-medium text-gray-700 min-w-0 break-words">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-violet-900 text-right break-words">{value}</p>
        </div>
    );
}

// Composant réutilisable pour les charts de sites/produits (barres empilées)
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
        [xAxisKey]: item.name || 'Sans donnée'
    }));

    const hasData = chartData.some(item => (item[dataKey] || 0) > 0 || (item.quantiteEnAttente || 0) > 0);

    if (!hasData) {
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
                            interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                maxWidth: '320px',
                                whiteSpace: 'normal'
                            }}
                            formatter={(value) => [formatNumber(value)]}
                            labelFormatter={(label, payload) => {
                                const fullName = payload?.[0]?.payload?.name;
                                return fullName || label;
                            }}
                            labelStyle={{ color: '#000' }}
                        />
                        <Bar dataKey="disponible" stackId="a" fill="#7c3aed" name="Disponible" />
                        <Bar dataKey="quantiteEnAttente" stackId="a" fill="#c4b5fd" name="En attente" radius={[8, 8, 0, 0]} />
                    </BarChart>
                    </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

// Composant pour les charts de transactions (bascule Nombre / Quantité)
function TransactionsChart({ title, data, mode, onModeChange, transformData }) {
    const chartData = data ? transformData(data) : [];

    const hasData = chartData.some(item => (item.count || 0) > 0 || (item.quantite || 0) > 0);

    if (!data || data.length === 0 || !hasData) {
        return (
            <Card className="border border-gray-200 bg-white">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <CardTitle className="text-black font-semibold">{title}</CardTitle>
                        <ModeToggle mode={mode} onModeChange={onModeChange} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-72 text-gray-500">
                        <p>Aucune donnée disponible</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-200 bg-white">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-black font-semibold">{title}</CardTitle>
                    <ModeToggle mode={mode} onModeChange={onModeChange} />
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                            formatter={(value) => [formatNumber(value), mode === 'count' ? 'Nombre' : 'Quantité']}
                            labelStyle={{ color: '#000' }}
                        />
                        <Legend />
                        <Bar
                            dataKey="count"
                            name="Nombre de transactions"
                            fill="#7c3aed"
                            radius={[8, 8, 0, 0]}
                            hide={mode !== 'count'}
                        />
                        <Bar
                            dataKey="quantite"
                            name="Quantité"
                            fill="#2563eb"
                            radius={[8, 8, 0, 0]}
                            hide={mode !== 'quantite'}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
        );
}

// Bascule Nombre / Quantité pour les charts de transactions
function ModeToggle({ mode, onModeChange }) {
    return (
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            <button
                type="button"
                onClick={() => onModeChange('count')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === 'count'
                    ? 'bg-white text-violet-700 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Nombre
            </button>
            <button
                type="button"
                onClick={() => onModeChange('quantite')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${mode === 'quantite'
                    ? 'bg-white text-violet-700 shadow-sm border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                Quantité
            </button>
        </div>
    );
}

export default DashboardPage;
