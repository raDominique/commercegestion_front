
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getMyStocksPassifs, withdrawStock } from '../../services/stocks_move.service.js';
import { getMySites } from '../../services/site.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '../../components/ui/dialog';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import { getAllUsersSelect } from '../../services/user.service';
import { getAllSitesSelect } from '../../services/site.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import MoveUpIcon from '@mui/icons-material/MoveUp';

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
	const [sites, setSites] = useState([]);
	const [detailPassif, setDetailPassif] = useState(null);
	const [usersOptions, setUsersOptions] = useState([]);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [allSites, setAllSites] = useState([]);
	const { user } = useAuth();

	const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
	const [withdrawalForm, setWithdrawalForm] = useState({
		actifId: '',
		siteOrigineId: '',
		siteDestinationId: '',
		quantite: '',
		prixUnitaire: '',
		detentaire: '',
		ayant_droit: '',
		observations: ''
	});
	const [maxWithdrawalQty, setMaxWithdrawalQty] = useState(undefined);

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

	const handleOpenWithdrawModal = item => {
		setWithdrawalForm({
			actifId: item.actifId?._id,
			siteOrigineId: item.siteOriginId?._id || '',
			siteDestinationId: '',
			quantite: '',
			prixUnitaire: item.prixUnitaire || '',
			detentaire: '',
			ayant_droit: '',
			observations: ''
		});

		setMaxWithdrawalQty(item.quantite);
		setWithdrawalModalOpen(true);
	};

	const handleWithdrawalSubmit = async e => {
		e.preventDefault();

		try {
			await withdrawStock(withdrawalForm);
			setWithdrawalModalOpen(false);
			fetchPassifs();
		} catch {
			toast.error('Erreur lors du retrait du stock');
		}
	};

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
		    <div className="px-6 mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<h1 className="text-2xl text-neutral-900">Mes Passifs</h1>
						<Input
							placeholder="Rechercher..."
							value={search}
							onChange={e => { setPage(1); setSearch(e.target.value); }}
							className="max-w-xs border-black bg-white"
						/>
					</div>
					<Card className="border-neutral-200 bg-white">
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
										<th className="p-4 text-xs text-neutral-600 text-left">Transférer</th>
									</tr>
								</thead>
								<tbody>
									{loading ? (
										<tr><td colSpan="7" className="p-8 text-center text-neutral-400">Chargement...</td></tr>
									) : passifs.length > 0 ? (
										passifs.map((item, idx) => (
											<tr key={idx} className="border-b border-neutral-100 last:border-0">
												<td className="p-4 text-sm">{item.situation || '-'}</td>
												<td className="p-4 text-sm">{item.type || '-'}</td>
												<td className="p-4 text-sm">{item.montant !== undefined ? item.montant.toLocaleString() : '-'}</td>
												<td className="p-4 text-sm">{item.departDe || '-'}</td>
												<td className="p-4 text-sm">{item.arrivee || '-'}</td>
												<td className="p-4 text-sm">{item.action || '-'}</td>
												<td className="p-4 text-sm">{item.date ? dateFormat(item.date) : '-'}</td>
												<td className="p-4 text-sm">
													<Button
														onClick={() => handleOpenWithdrawModal(item)}
														variant="outline"
													>
														<MoveUpIcon fontSize="small" className="mr-1" />
														Retirer
													</Button>
												</td>
											</tr>
										))
									) : (
										<tr><td colSpan="7" className="p-8 text-center text-neutral-400">Aucun passif trouvé</td></tr>
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

					{/* Modal de retrait de stock */}
					<Dialog open={withdrawalModalOpen} onOpenChange={setWithdrawalModalOpen}>
						<DialogContent className="bg-white border border-neutral-200">
							<DialogHeader>
								<DialogTitle>Retirer le produit</DialogTitle>
							</DialogHeader>
							<form className="space-y-4" onSubmit={handleWithdrawalSubmit}>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="siteOrigineId">Site d'origine</Label>
										<Select value={withdrawalForm.siteOrigineId} onValueChange={val => setWithdrawalForm(f => ({ ...f, siteOrigineId: val }))}>
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
										<Select value={withdrawalForm.siteDestinationId} onValueChange={val => setWithdrawalForm(f => ({ ...f, siteDestinationId: val }))}>
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
										<Input name="quantite" value={withdrawalForm.quantite} onChange={e => setWithdrawalForm(f => ({ ...f, quantite: e.target.value }))} required placeholder="Quantité à retirer" className="border-neutral-300" type="number" min="1" max={maxWithdrawalQty || undefined} />
									</div>
									<div className="space-y-2">
										<Label htmlFor="prixUnitaire">Prix unitaire</Label>
										<Input name="prixUnitaire" value={withdrawalForm.prixUnitaire} onChange={e => setWithdrawalForm(f => ({ ...f, prixUnitaire: e.target.value }))} required placeholder="Prix unitaire" className="border-neutral-300" type="number" min="0" />
									</div>
									<div className="space-y-2">
										<Label htmlFor="detentaire">Détenteur</Label>
										<Select value={withdrawalForm.detentaire} onValueChange={val => setWithdrawalForm(f => ({ ...f, detentaire: val }))}>
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
										<Select value={withdrawalForm.ayant_droit} onValueChange={val => setWithdrawalForm(f => ({ ...f, ayant_droit: val }))}>
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
										<Input name="observations" value={withdrawalForm.observations} onChange={e => setWithdrawalForm(f => ({ ...f, observations: e.target.value }))} placeholder="Observations" className="border-neutral-300" />
									</div>
								</div>
								<div className="flex justify-end gap-2 mt-4">
									<Button variant="outline" type="button" onClick={() => setWithdrawalModalOpen(false)}>Annuler</Button>
									<Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit">Valider le retrait</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	);
};
export default Passifs;
