
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getMyStocksPassifs } from '../../services/stocks_move.service.js';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../../components/ui/dialog';
import useDateFormat from '../../utils/useDateFormat.jsx';

const Passifs = () => {
	const dateFormat = useDateFormat();
	usePageTitle('Passifs');
	const [passifs, setPassifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	// Pour le détail d'un passif
	const [detailOpen, setDetailOpen] = useState(false);
	const [detailPassif, setDetailPassif] = useState(null);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const fetchPassifs = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const params = {
				limit,
				page,
			};
			const res = await getMyStocksPassifs(params, token);
			setPassifs(res.data || []);
			setTotal(res.total || 0);
		} catch (err) {
			setPassifs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPassifs();
	}, [search, page, limit]);

	// Fonction pour afficher le détail d'un passif
	const handleShowDetail = async (passifId) => {
		setLoadingDetail(true);
		setDetailOpen(true);
		try {
			const data = await getPassifById(passifId);
			setDetailPassif(data);
		} catch (err) {
			setDetailPassif(null);
			console.error('Erreur lors de la récupération du détail du passif :', err);
		} finally {
			setLoadingDetail(false);
		}
	};

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<h1 className="text-2xl text-neutral-900">Mes Passifs</h1>
				<Input
					placeholder="Rechercher..."
					value={search}
					onChange={e => { setPage(1); setSearch(e.target.value); }}
					className="max-w-xs border-neutral-300"
				/>
			</div>
			<Card className="border-neutral-200">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-neutral-50 border-b border-neutral-200">
							<tr>
								<th className="p-4 text-xs text-neutral-600 text-left">Produit</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Image</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Site origine</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Site destination</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Quantité</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Prix unitaire</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Type</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Date</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="6" className="p-8 text-center text-neutral-400">Chargement...</td></tr>
							) : passifs.length > 0 ? (
								passifs.map((item) => (
									<tr key={item._id} className="border-b border-neutral-100 last:border-0">
										<td className="p-4 text-sm font-semibold text-neutral-900">{item.productId?.productName || '-'}</td>
										<td className="p-4 text-sm">
											{item.productId?.productImage ? (
												<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-12 h-12 object-cover rounded" />
											) : (
												<span className="text-neutral-400">-</span>
											)}
										</td>
										<td className="p-4 text-sm">{item.siteOrigineId?.siteName || '-'}</td>
										<td className="p-4 text-sm">{item.siteDestinationId?.siteName || '-'}</td>
										<td className="p-4 text-sm">{item.quantite || '-'}</td>
										<td className="p-4 text-sm">{item.prixUnitaire || '-'}</td>
										<td className="p-4 text-sm">{item.type || '-'}</td>
										<td className="p-4 text-sm">{item.createdAt ? dateFormat(item.createdAt) : '-'}</td>
									</tr>
								))
							) : (
								<tr><td colSpan="6" className="p-8 text-center text-neutral-400">Aucun passif trouvé</td></tr>
							)}
						</tbody>
					</table>
				</div>
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
			{/* Modal de détail du passif avec Dialog */}
			<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
				<DialogContent aria-describedby="detail-passif-desc">
					<DialogTitle>Détail du Passif</DialogTitle>
					<DialogDescription id="detail-passif-desc">
						Informations détaillées sur le passif sélectionné.
					</DialogDescription>
					{loadingDetail ? (
						<div className="p-8 text-center text-neutral-400">Chargement...</div>
					) : detailPassif ? (
						<div className="space-y-2 text-sm">
							<div><b>Produit :</b> {detailPassif.productId?.productName || '-'}</div>
							<div><b>Produit codeCPC :</b> {detailPassif.productId?.codeCPC || '-'}</div>
							<div><b>Quantité :</b> {detailPassif.quantite || '-'}</div>
						</div>
					) : (
						<div className="p-8 text-center text-neutral-400">Aucune donnée</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};
export default Passifs;
