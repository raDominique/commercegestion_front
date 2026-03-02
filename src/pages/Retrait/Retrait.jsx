import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getMyStocksPassifs } from '../../services/stocks_move.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const Retrait = () => {
	const { user } = useAuth();
	const dateFormat = useDateFormat();

	usePageTitle('Retrait');

	const [passifs, setPassifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [total, setTotal] = useState(0);

	/* ================= FETCH ================= */

	const fetchPassifs = async () => {
		setLoading(true);

		try {
			const token = localStorage.getItem('token');

			const params = {
				limit,
				page
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

	/* ================= RENDER ================= */

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<>
					{/* HEADER */}
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<h1 className="text-2xl text-neutral-900">
							Mes Retraits
						</h1>

						<Input
							placeholder="Rechercher..."
							value={search}
							onChange={e => {
								setPage(1);
								setSearch(e.target.value);
							}}
							className="max-w-xs border-neutral-300"
						/>
					</div>

					{/* TABLE */}
					<Card className="border-neutral-200">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-neutral-50 border-b border-neutral-200">
									<tr>
										<th className="p-4 text-xs text-left">Situation</th>
										<th className="p-4 text-xs text-left">Type</th>
										<th className="p-4 text-xs text-left">Montant</th>
										<th className="p-4 text-xs text-left">Départ</th>
										<th className="p-4 text-xs text-left">Arrivée</th>
										<th className="p-4 text-xs text-left">Action</th>
										<th className="p-4 text-xs text-left">Date</th>
									</tr>
								</thead>

								<tbody>
									{loading ? (
										<tr>
											<td colSpan="7" className="p-8 text-center text-neutral-400">
												Chargement...
											</td>
										</tr>
									) : passifs.length > 0 ? (
										passifs.map((item, idx) => (
											<tr
												key={idx}
												className="border-b border-neutral-100 last:border-0"
											>
												<td className="p-4 font-semibold">
													{item.situation || '-'}
												</td>

												<td className="p-4">
													{item.type || '-'}
												</td>

												<td className="p-4">
													{item.montant !== undefined
														? item.montant.toLocaleString()
														: '-'}
												</td>

												<td className="p-4">
													{item.departDe || '-'}
												</td>

												<td className="p-4">
													{item.arrivee || '-'}
												</td>

												<td className="p-4">
													{item.action || '-'}
												</td>

												<td className="p-4">
													{item.date
														? dateFormat(item.date)
														: '-'}
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="7" className="p-8 text-center text-neutral-400">
												Aucun retrait trouvé
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Card>

					{/* PAGINATION */}
					<div className="flex justify-end items-center gap-4 mt-4">
						<Button
							variant="outline"
							size="sm"
							disabled={page === 1 || loading}
							onClick={() =>
								setPage(p => Math.max(1, p - 1))
							}
						>
							Précédent
						</Button>

						<span className="text-sm text-neutral-600">
							Page {page} /{' '}
							{Math.max(1, Math.ceil(total / limit))}
						</span>

						<Button
							variant="outline"
							size="sm"
							disabled={
								page >= Math.ceil(total / limit) ||
								loading
							}
							onClick={() => setPage(p => p + 1)}
						>
							Suivant
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default Retrait;