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
import MoveUpIcon from '@mui/icons-material/MoveUp';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { getAllUsersSelect } from '../../services/user.service';
import { getAllSitesSelect } from '../../services/site.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const Actifs = () => {
	usePageTitle('Actifs');

	const { user } = useAuth();
	const dateFormat = useDateFormat();

	const [actifs, setActifs] = useState([]);
	const [sites, setSites] = useState([]);
	const [usersOptions, setUsersOptions] = useState([]);
	const [allSites, setAllSites] = useState([]);

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
		getMySites().then(res => setSites(Array.isArray(res) ? res : []));
		getAllUsersSelect().then(res => {
			if (Array.isArray(res)) {
				setUsersOptions(res);
			} else if (res && Array.isArray(res.data)) {
				setUsersOptions(res.data);
			} else {
				setUsersOptions([]);
			}
		});
		getAllSitesSelect().then(res => setAllSites(Array.isArray(res) ? res : []));
	}, []);

	/* ================= ACTIONS ================= */

	const handleOpenTransferModal = item => {
		setTransferForm({
			actifId: item._id,
			productId: item.productId?._id || '',
			siteOrigineId: item.siteOrigineId?._id || '', // Correction ici
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
		<div className="px-6 mx-auto">
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
							className="max-w-xs border-black bg-white"
						/>
					</div>

					{/* TABLE */}
					<Card className="border-neutral-200 bg-white">
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
										<th className="p-4 text-xs text-neutral-600 text-right">Actions</th>
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
														variant="outline"
													>
														<MoveUpIcon className="w-5 h-5" />
														Transférer
													</Button>

													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															handleShowDetail(item._id)
														}
													>
														<InfoIcon className="w-5 h-5 text-violet-600" />
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

					{/* Modal transfert */}
					<Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
						<DialogContent className="bg-white border border-neutral-200">
							<DialogHeader>
								<DialogTitle>Transférer le produit</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleTransferSubmit}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="siteOrigineId">Site d'origine</Label>
										<Select value={transferForm.siteOrigineId} onValueChange={val => setTransferForm(f => ({ ...f, siteOrigineId: val }))}>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner le site d'origine" />
											</SelectTrigger>
											<SelectContent>
												{allSites.map(site => (
													<SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="siteDestinationId">Site de destination</Label>
										<Select value={transferForm.siteDestinationId} onValueChange={val => setTransferForm(f => ({ ...f, siteDestinationId: val }))}>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner le site de destination" />
											</SelectTrigger>
											<SelectContent>
												{allSites.map(site => (
													<SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="quantite">Quantité</Label>
										<Input name="quantite" value={transferForm.quantite} onChange={e => setTransferForm(f => ({ ...f, quantite: e.target.value }))} required placeholder="Quantité à transférer" className="border-neutral-300" type="number" min="1" max={maxTransferQty || undefined} />
									</div>
									<div className="space-y-2">
										<Label htmlFor="prixUnitaire">Prix unitaire</Label>
										<Input name="prixUnitaire" value={transferForm.prixUnitaire} onChange={e => setTransferForm(f => ({ ...f, prixUnitaire: e.target.value }))} required placeholder="Prix unitaire" className="border-neutral-300" type="number" min="0" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="detentaire">Détenteur</Label>
										<Select value={transferForm.detentaire} onValueChange={val => setTransferForm(f => ({ ...f, detentaire: val }))}>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner le détenteur" />
											</SelectTrigger>
											<SelectContent>
												{Array.isArray(usersOptions) && usersOptions.length > 0 ? (
													usersOptions.map(user => (
														<SelectItem key={user._id} value={user._id}>{user.name || user.userNickName || user.userName || user.userFirstname || user.userId}</SelectItem>
													))
												) : (
													<div className="px-4 py-2 text-neutral-400">Aucun utilisateur</div>
												)}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="ayant_droit">Ayant droit</Label>
										<Select value={transferForm.ayant_droit} onValueChange={val => setTransferForm(f => ({ ...f, ayant_droit: val }))}>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionner l'ayant droit" />
											</SelectTrigger>
											<SelectContent>
												{Array.isArray(usersOptions) && usersOptions.length > 0 ? (
													usersOptions.map(user => (
														<SelectItem key={user._id} value={user._id}>{user.name || user.userNickName || user.userName || user.userFirstname || user.userId}</SelectItem>
													))
												) : (
													<div className="px-4 py-2 text-neutral-400">Aucun utilisateur</div>
												)}
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="observations">Observations</Label>
										<Input name="observations" value={transferForm.observations} onChange={e => setTransferForm(f => ({ ...f, observations: e.target.value }))} placeholder="Observations" className="border-neutral-300" />
									</div>
								</div>
								<div className="flex justify-end gap-2 mt-4">
									<Button variant="outline" type="button" onClick={() => setTransferModalOpen(false)}>Annuler</Button>
									<Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit">Valider le transfert</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

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