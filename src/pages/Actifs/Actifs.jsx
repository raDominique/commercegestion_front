import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import {
	getMyStocksActifs,
	withdrawStock
} from '../../services/stocks_move.service';
import { getMySites } from '../../services/site.service';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from '../../components/ui/dialog';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import InfoIcon from '@mui/icons-material/Info';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { getAllUsersSelect } from '../../services/user.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const Actifs = () => {
	usePageTitle('Actifs');

	const { user } = useAuth();
	const dateFormat = useDateFormat();

	const [actifs, setActifs] = useState([]);
	const [sites, setSites] = useState([]);
	const [usersOptions, setUsersOptions] = useState([]);

	const [loading, setLoading] = useState(false);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const limit = 10;
	const [total, setTotal] = useState(0);

	const [transferModalOpen, setTransferModalOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);

	const [detailActif, setDetailActif] = useState(null);
	const [maxTransferQty, setMaxTransferQty] = useState(null);

	const [transferForm, setTransferForm] = useState({
		actifId: '',
		siteOrigineId: '',
		siteDestinationId: '',
		quantite: '',
		prixUnitaire: '',
		detentaire: '',
		ayant_droit: '',
		observations: ''
	});

	/* ================= FETCH ================= */

	const fetchActifs = async () => {
		try {
			setLoading(true);
			const res = await getMyStocksActifs({
				page,
				limit,
				search
			});

			setActifs(res.data || []);
			setTotal(res.total || 0);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchActifs();
	}, [page, search]);

	useEffect(() => {
		getMySites().then(res => setSites(res || []));
		getAllUsersSelect().then(res => setUsersOptions(res || []));
	}, []);

	/* ================= ACTIONS ================= */

	const handleOpenTransferModal = item => {
		setTransferForm({
			actifId: item._id,
			siteOrigineId: item.siteDestinationId?._id,
			siteDestinationId: '',
			quantite: '',
			prixUnitaire: item.prixUnitaire || '',
			detentaire: '',
			ayant_droit: '',
			observations: ''
		});

		setMaxTransferQty(item.quantite);
		setTransferModalOpen(true);
	};

	const handleTransferSubmit = async e => {
		e.preventDefault();

		try {
			await withdrawStock(transferForm);

			toast.success('Transfert effectué');
			setTransferModalOpen(false);
			fetchActifs();
		} catch {
			toast.error('Erreur lors du transfert');
		}
	};

	const handleShowDetail = async id => {
		try {
			setLoadingDetail(true);
			const actif = actifs.find(a => a._id === id);
			setDetailActif(actif);
			setDetailOpen(true);
		} finally {
			setLoadingDetail(false);
		}
	};

	/* ================= RENDER ================= */

	return (
		<div className="p-6 max-w-7xl mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<>
					{/* HEADER */}
					<div className="flex justify-between mb-6">
						<h1 className="text-2xl">Mes Actifs</h1>

						<Input
							placeholder="Rechercher..."
							value={search}
							onChange={e => {
								setPage(1);
								setSearch(e.target.value);
							}}
							className="max-w-xs"
						/>
					</div>

					{/* TABLE */}
					<Card className="border-neutral-200">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-neutral-50 border-b border-neutral-200">
									<tr>
										<th className="p-4 text-xs text-neutral-600 text-left">Produit</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Image</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Site origine</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Site destination</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Qté</th>
										<th className="p-4 text-xs text-neutral-600 text-left">PU</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Total</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Date</th>
										<th className="p-4 text-xs text-neutral-600 text-left">Actions</th>
									</tr>
								</thead>

								<tbody>
									{loading ? (
										<tr>
											<td colSpan="9" className="p-8 text-center text-neutral-400">
												Chargement...
											</td>
										</tr>
									) : actifs.length ? (
										actifs.map(item => (
											<tr key={item._id} className="border-b border-neutral-100 last:border-0">
												<td className="p-4 text-sm">
													{item.productId?.productName || '-'}
												</td>

												<td className="p-4 text-sm">
													{item.productId?.productImage && (
														<img
															src={getFullMediaUrl(
																item.productId.productImage
															)}
															className="w-12 h-12 rounded object-cover"
														/>
													)}
												</td>

												<td className="p-4 text-sm">
													{item.siteOrigineId?.siteName || '-'}
												</td>

												<td className="p-4 text-sm">
													{item.siteDestinationId?.siteName || '-'}
												</td>

												<td className="p-4 text-sm">{item.quantite}</td>
												<td className="p-4 text-sm">{item.prixUnitaire}</td>

												<td className="p-4 text-sm">
													{item.prixUnitaire * item.quantite}
												</td>

												<td className="p-4 text-sm">
													{item.createdAt
														? dateFormat(item.createdAt)
														: '-'}
												</td>

												<td className="p-4 text-right space-x-2">
													<Button
														onClick={() =>
															handleOpenTransferModal(item)
														}
													>
														Transférer
													</Button>

													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleShowDetail(item._id)
														}
													>
														<InfoIcon />
													</Button>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="9" className="p-8 text-center text-neutral-400">
												Aucun actif trouvé
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</Card>

					{/* PAGINATION */}
					<div className="flex justify-end gap-4 mt-4">
						<Button
							disabled={page === 1}
							onClick={() => setPage(p => p - 1)}
						>
							Précédent
						</Button>

						<span>
							Page {page} / {Math.max(1, Math.ceil(total / limit))}
						</span>

						<Button
							disabled={page >= Math.ceil(total / limit)}
							onClick={() => setPage(p => p + 1)}
						>
							Suivant
						</Button>
					</div>

					{/* MODAL DETAIL */}
					<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Détail actif</DialogTitle>
								<DialogDescription>
									Informations détaillées
								</DialogDescription>
							</DialogHeader>

							{loadingDetail ? (
								<div>Chargement...</div>
							) : detailActif && (
								<div className="space-y-2 text-sm">
									<div>
										<b>Produit :</b>{' '}
										{detailActif.productId?.productName}
									</div>
									<div>
										<b>Quantité :</b> {detailActif.quantite}
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	);
};

export default Actifs;