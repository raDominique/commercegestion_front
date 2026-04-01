import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
import { Badge } from '../../components/ui/badge';
import { formatThousands } from '../../utils/formatNumber';
import { getDeposits } from '../../services/stocks_move.service';
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
			const res = await getDeposits(params, token);
			const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
			const totalCount = Number(res?.pagination?.total ?? res?.total ?? items.length);
			setActifs(items);
			setTotal(Number.isFinite(totalCount) ? totalCount : 0);
		} catch (err) {
			setActifs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchActifs();
	}, [page, limit]);

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

				<Card className="border-neutral-200 bg-white">
					<DepotTableOrList loading={loading} actifs={actifs} handleShowDetail={() => { }} dateFormat={dateFormat} />
				</Card>

				<div className="flex justify-end items-center gap-4 mt-4">
					<div className="flex items-center gap-2">
						<label htmlFor="depot-limit" className="text-sm text-neutral-600">Par page</label>
						<select
							id="depot-limit"
							className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm"
							value={limit}
							onChange={(e) => {
								setLimit(Number(e.target.value));
								setPage(1);
							}}
						>
							<option value={10}>10</option>
							<option value={20}>20</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
					</div>
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
							<TableHead className="text-xs text-neutral-600">Opérateur</TableHead>
							<TableHead className="text-xs text-neutral-600">Détenteur</TableHead>
							<TableHead className="text-xs text-neutral-600">Ayant droit</TableHead>
							<TableHead className="text-xs text-neutral-600">Site origine</TableHead>
							<TableHead className="text-xs text-neutral-600">Site destination</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Quantité</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Prix unitaire</TableHead>
							<TableHead className="text-xs text-neutral-600">Validation</TableHead>
							<TableHead className="text-xs text-neutral-600">Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{actifs.map((item) => {
							const validationVariant = item.isValide ? 'default' : 'secondary';
							const operatorName = item.operatorId?.userNickName || item.operatorId?.userName || '-';
							const detenteurName = item.detentaire?.userNickName || item.detentaire?.userName || '-';
							const ayantDroitName = item.ayant_droit?.userNickName || item.ayant_droit?.userName || '-';
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
									<TableCell className="text-sm text-neutral-600">{operatorName}</TableCell>
									<TableCell className="text-sm text-neutral-600">{detenteurName}</TableCell>
									<TableCell className="text-sm text-neutral-600">{ayantDroitName}</TableCell>
									<TableCell className="text-sm text-neutral-600">{item.siteOrigineId?.siteName || '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600">{item.siteDestinationId?.siteName || '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600 text-right">{item.quantite !== undefined && item.quantite !== null ? formatThousands(item.quantite) : '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600 text-right">{item.prixUnitaire !== undefined && item.prixUnitaire !== null ? formatThousands(item.prixUnitaire) : '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600"><Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge></TableCell>
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
				const validationVariant = item.isValide ? 'default' : 'secondary';
				const operatorName = item.operatorId?.userNickName || item.operatorId?.userName || '-';
				const detenteurName = item.detentaire?.userNickName || item.detentaire?.userName || '-';
				const ayantDroitName = item.ayant_droit?.userNickName || item.ayant_droit?.userName || '-';
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
									<div className="text-sm text-neutral-600">Opérateur: {operatorName}</div>
									<div className="text-sm text-neutral-600">Détenteur: {detenteurName}</div>
									<div className="text-sm text-neutral-600">Ayant droit: {ayantDroitName}</div>
									<div className="text-sm text-neutral-600"><Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge></div>
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
