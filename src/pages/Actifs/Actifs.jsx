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
import useScreenType from '../../utils/useScreenType';
import { getFullMediaUrl } from '../../services/media.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { getAllUsersSelect } from '../../services/user.service';
import { getAllSitesSelect } from '../../services/site.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const Actifs = () => {
	usePageTitle('Actifs');

	const { user } = useAuth();
	const dateFormat = useDateFormat();

	const { isDesktop } = useScreenType();

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
			const payload = {
				...transferForm,
				quantite: Number(transferForm.quantite),
				prixUnitaire: Number(transferForm.prixUnitaire),
			};

			await withdrawStock(payload);

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
						<ActifsTableOrList loading={loading} actifs={actifs} dateFormat={dateFormat} isDesktop={isDesktop} onTransfer={handleOpenTransferModal} onShowDetail={handleShowDetail} />
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
										<b>Quantité :</b> {formatThousands(detailActif.quantite)}
									</div>
									<div>
										<b>Prix unitaire :</b> {formatThousands(detailActif.prixUnitaire)}
									</div>
									<div>
										<b>Total :</b> {formatThousands(detailActif.prixUnitaire * detailActif.quantite)}
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

function ActifsTableOrList({ loading, actifs, dateFormat, isDesktop, onTransfer, onShowDetail }) {
	if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
	if (!actifs || actifs.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun actif trouvé</div>;

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
							<TableHead className="text-xs text-neutral-600 text-right">Qté</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">PU (Ar)</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Total (Ar)</TableHead>
							<TableHead className="text-xs text-neutral-600">Détenteur</TableHead>
							<TableHead className="text-xs text-neutral-600">Ayant droit</TableHead>
							<TableHead className="text-xs text-neutral-600">Date</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right p-4">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{actifs.map(item => (
							<TableRow key={item._id}>
								<TableCell className="text-sm">{item.productId?.productName || '-'}</TableCell>
								<TableCell>
									{item.productId?.productImage ? (
										<img src={getFullMediaUrl(item.productId.productImage)} className="w-12 h-12 rounded object-cover" />
									) : (
										<span className="text-neutral-400">-</span>
									)}
								</TableCell>
								<TableCell className="text-sm">{item.siteOrigineId?.siteName || '-'}</TableCell>
								<TableCell className="text-sm">{item.siteDestinationId?.siteName || '-'}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.quantite)}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.prixUnitaire)}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.prixUnitaire * item.quantite)}</TableCell>
								<TableCell className="text-sm">{item.detentaire?.userName || '-'}</TableCell>
								<TableCell className="text-sm">{item.ayant_droit?.userName || '-'}</TableCell>
								<TableCell className="text-sm">{item.createdAt ? dateFormat(item.createdAt) : '-'}</TableCell>
								<TableCell className="text-sm text-right">
									<Button onClick={() => onTransfer(item)} variant="outline">
										<MoveUpIcon className="w-5 h-5" />
										Transférer
									</Button>
									<Button variant="ghost" size="sm" onClick={() => onShowDetail(item._id)}>
										<InfoIcon className="w-5 h-5 text-violet-600" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="space-y-3 p-4">
			{actifs.map(item => (
				<Card key={item._id} className="p-4">
					<div className="flex items-start justify-between gap-4">
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
								<div className="text-xs text-neutral-500">{item.siteOrigineId?.siteName || '-'} → {item.siteDestinationId?.siteName || '-'}</div>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="text-sm text-neutral-900">Qté: {formatThousands(item.quantite)}</div>
							<div className="text-sm text-neutral-600">PU: {formatThousands(item.prixUnitaire)}</div>
							<div className="text-sm text-neutral-600">Total: {formatThousands(item.prixUnitaire * item.quantite)}</div>
							<div className="flex gap-2 mt-2">
								<Button onClick={() => onTransfer(item)} variant="outline" size="sm"><MoveUpIcon className="w-4 h-4" /> Transférer</Button>
								<Button variant="ghost" size="sm" onClick={() => onShowDetail(item._id)}><InfoIcon className="w-4 h-4 text-violet-600" /></Button>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}