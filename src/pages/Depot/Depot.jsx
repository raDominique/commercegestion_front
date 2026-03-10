import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
import { Badge } from '../../components/ui/badge';
import { formatThousands } from '../../utils/formatNumber';
import { getMyStocksActifs } from '../../services/stocks_move.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const Depot = () => {
	const { user } = useAuth();
	if (user && user.userValidated === false) {
		return (
			    <div className="px-6 mx-auto">
				<UserNotValidatedBanner />
			</div>
		);
	}
	const dateFormat = useDateFormat();
	usePageTitle('Dépôt');
	const [actifs, setActifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	const fetchActifs = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const params = {
				limit,
				page,
			};
			const res = await getMyStocksActifs(params, token);
			setActifs(res.data || []);
			setTotal(res.total || 0);
		} catch (err) {
			setActifs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchActifs();
	}, [search, page, limit]);

	return (
			<div className="px-6 mx-auto">
				{user && user.userValidated === false && (
					<UserNotValidatedBanner />
				)}

				<div className="space-y-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl text-neutral-900 mb-2">Mes Dépôts</h1>
							<p className="text-sm text-neutral-600">Historique de vos dépôts</p>
						</div>
					</div>

					<div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
						<div className="relative flex-1 min-w-0">
							<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
							<Input
								placeholder="Rechercher..."
								value={search}
								onChange={e => { setPage(1); setSearch(e.target.value); }}
								className="pl-10 border-black bg-white w-full"
							/>
						</div>
					</div>

					<Card className="border-neutral-200 bg-white">
						<DepotTableOrList loading={loading} actifs={actifs} handleShowDetail={() => {}} dateFormat={dateFormat} />
					</Card>

					<div className="flex justify-end items-center gap-4 mt-4">
						<Button
							variant="outline"
							size="sm"
							disabled={page === 1 || loading}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Précédent
						</Button>
						<span className="text-sm text-neutral-600">
							Page {page} / {Math.max(1, Math.ceil(total / limit))}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={page >= Math.ceil(total / limit) || loading}
							onClick={() => setPage((p) => p + 1)}
						>
							Suivant
						</Button>
					</div>
				</div>
			</div>
	);
};
export default Depot;

	function DepotTableOrList({ loading, actifs, handleShowDetail, dateFormat }) {
		const { isDesktop } = useScreenType();

		if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
		if (!actifs || actifs.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun dépôt trouvé</div>;

		if (isDesktop) {
			return (
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="text-xs text-neutral-600">Produit</TableHead>
								<TableHead className="text-xs text-neutral-600">Image</TableHead>
								<TableHead className="text-xs text-neutral-600">Site origine</TableHead>
								<TableHead className="text-xs text-neutral-600">Site destination</TableHead>
								<TableHead className="text-xs text-neutral-600">Quantité</TableHead>
								<TableHead className="text-xs text-neutral-600">Prix unitaire</TableHead>
								<TableHead className="text-xs text-neutral-600">Type</TableHead>
								<TableHead className="text-xs text-neutral-600">Date</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{actifs.map((item) => {
								const typeVariant = item.type === 'RETRAIT' ? 'destructive' : item.type === 'DEPOT' ? 'secondary' : 'default';
								return (
									<TableRow key={item._id}>
										<TableCell className="text-sm font-semibold text-neutral-900">{item.productId?.productName || '-'}</TableCell>
										<TableCell>
											{item.productId?.productImage ? (
												<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-12 h-12 object-cover rounded" />
											) : (
												<span className="text-neutral-400">-</span>
											)}
										</TableCell>
										<TableCell className="text-sm text-neutral-600">{item.siteOrigineId?.siteName || '-'}</TableCell>
										<TableCell className="text-sm text-neutral-600">{item.siteDestinationId?.siteName || '-'}</TableCell>
										<TableCell className="text-sm text-neutral-600">{item.quantite !== undefined && item.quantite !== null ? formatThousands(item.quantite) : '-'}</TableCell>
										<TableCell className="text-sm text-neutral-600">{item.prixUnitaire !== undefined && item.prixUnitaire !== null ? formatThousands(item.prixUnitaire) : '-'}</TableCell>
										<TableCell className="text-sm text-neutral-600"><Badge variant={typeVariant}>{item.type || '-'}</Badge></TableCell>
										<TableCell className="text-sm text-neutral-600">{item.createdAt ? dateFormat(item.createdAt) : '-'}</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			);
		}

		// Mobile cards
		return (
			<div className="space-y-3 p-4">
				{actifs.map((item) => {
					const typeVariant = item.type === 'RETRAIT' ? 'destructive' : item.type === 'DEPOT' ? 'secondary' : 'default';
					return (
						<Card key={item._id} className="p-4">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded overflow-hidden">
											{item.productId?.productImage ? (
												<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-full h-full object-cover" />
											) : (
												<span className="text-neutral-400">-</span>
											)}
										</div>
										<div className="min-w-0">
											<div className="font-medium text-neutral-900 truncate">{item.productId?.productName || '-'}</div>
											<div className="text-xs text-neutral-500 truncate">{item.siteOrigineId?.siteName || '-'}</div>
											<div className="text-xs text-neutral-500 truncate">{item.siteDestinationId?.siteName || '-'}</div>
										</div>
									</div>
									<div className="mt-3 flex flex-wrap items-center gap-2">
										<div className="text-sm text-neutral-900">Qty: {item.quantite !== undefined && item.quantite !== null ? formatThousands(item.quantite) : '-'}</div>
										<div className="text-sm text-neutral-600">Prix: {item.prixUnitaire !== undefined && item.prixUnitaire !== null ? formatThousands(item.prixUnitaire) : '-'}</div>
										<div className="text-sm text-neutral-600"><Badge variant={typeVariant}>{item.type || '-'}</Badge></div>
										<div className="text-sm text-neutral-600">{item.createdAt ? dateFormat(item.createdAt) : '-'}</div>
									</div>
								</div>
								<div className="flex flex-col items-end gap-2">
									<Button variant="ghost" size="sm" aria-label={`Détail ${item._id}`} onClick={() => handleShowDetail(item._id)}>
										<InfoIcon className="w-5 h-5 text-violet-600" />
									</Button>
								</div>
							</div>
						</Card>
					);
				})}
			</div>
		);
	}
