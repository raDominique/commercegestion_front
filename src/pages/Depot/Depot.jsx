import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getMyStocksActifs } from '../../services/stocks_move.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';

const Depot = () => {
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
		<div className="p-6 max-w-5xl mx-auto">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<h1 className="text-2xl text-neutral-900">Mes Dépôts</h1>
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
							) : actifs.length > 0 ? (
								actifs.map((item) => (
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
								<tr><td colSpan="6" className="p-8 text-center text-neutral-400">Aucun dépôt trouvé</td></tr>
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
		</div>
	);
};
export default Depot;
