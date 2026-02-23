import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getMyStocksPassifs } from '../../services/stocks_move.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';

const Retrait = () => {
	const dateFormat = useDateFormat();
	usePageTitle('Retrait');
	const [passifs, setPassifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	const fetchPassifs = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const params = {
				limit,
				page,
			};
			const res = await getMyStocksPassifs(params, token);
			setPassifs(Array.isArray(res.data) ? res.data : []);
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

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
				<h1 className="text-2xl text-neutral-900">Mes Retraits</h1>
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
								<th className="p-4 text-xs text-neutral-600 text-left">Situation</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Type</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Montant</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Départ</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Arrivée</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Action</th>
								<th className="p-4 text-xs text-neutral-600 text-left">Date</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr><td colSpan="7" className="p-8 text-center text-neutral-400">Chargement...</td></tr>
							) : passifs.length > 0 ? (
								passifs.map((item, idx) => (
									<tr key={idx} className="border-b border-neutral-100 last:border-0">
										<td className="p-4 text-sm font-semibold text-neutral-900">{item.situation || '-'}</td>
										<td className="p-4 text-sm">{item.type || '-'}</td>
										<td className="p-4 text-sm">{item.montant !== undefined ? item.montant.toLocaleString() : '-'}</td>
										<td className="p-4 text-sm">{item.departDe || '-'}</td>
										<td className="p-4 text-sm">{item.arrivee || '-'}</td>
										<td className="p-4 text-sm">{item.action || '-'}</td>
										<td className="p-4 text-sm">{item.date ? dateFormat(item.date) : '-'}</td>
									</tr>
								))
							) : (
								<tr><td colSpan="7" className="p-8 text-center text-neutral-400">Aucun retrait trouvé</td></tr>
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
export default Retrait;
