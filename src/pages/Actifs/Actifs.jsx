import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getActifs } from '../../services/ledger.service';
import { withdrawStock } from '../../services/stocks_move.service';
import { getProfile } from '../../services/auth.service';
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
import useScreenType from '../../utils/useScreenType';
import { getFullMediaUrl } from '../../services/media.service';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { getAllUsersSelect } from '../../services/user.service';
import { getMySites } from '../../services/site.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';

const Actifs = () => {
	usePageTitle('Actifs');

	const { user } = useAuth();
	const dateFormat = useDateFormat();

	const { isDesktop } = useScreenType();

	const [actifs, setActifs] = useState([]);
	const [usersOptions, setUsersOptions] = useState([]);
	const [allSites, setAllSites] = useState([]);

	const [loading, setLoading] = useState(false);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const limit = 10;
	const [total, setTotal] = useState(0);

	const [detailOpen, setDetailOpen] = useState(false);

	const [detailActif, setDetailActif] = useState(null);
	const [maxTransferQty, setMaxTransferQty] = useState(null);

	const [productsOnSite, setProductsOnSite] = useState([]);
	const [transferForm, setTransferForm] = useState({
		actifId: '',
		productId: '',
		siteOrigineId: '',
		siteDestinationId: '',
		quantite: '',
		prixUnitaire: '',
		detentaire: '',
		ayant_droit: '',
		observations: ''
	});

	const fetchActifs = async () => {
		try {
			setLoading(true);
			// Récupérer l'userId via le contexte ou l'API getProfile si nécessaire
			let userId = user?._id;
			if (!userId) {
				try {
					const profile = await getProfile();
					userId = profile?._id || profile?.id;
				} catch (e) {
					throw new Error("Impossible de récupérer l'identifiant utilisateur");
				}
			}
			const params = { page, limit, search };
			const res = await getActifs(userId, params);
			const actifsList = Array.isArray(res.data) ? res.data : [];
			setActifs(actifsList);
			setTotal(actifsList.length);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchActifs();
	}, [page, search]);

	useEffect(() => {
		getAllUsersSelect().then(res => {
			if (Array.isArray(res)) {
				setUsersOptions(res);
			} else if (res && Array.isArray(res.data)) {
				setUsersOptions(res.data);
			} else {
				setUsersOptions([]);
			}
		});
		getMySites().then(res => {
			const sites = res?.data || [];
			setAllSites(Array.isArray(sites) ? sites : []);
		});
	}, []);

	/* ================= ACTIONS ================= */

	const handleSelectSiteOrigine = siteId => {
		setTransferForm(prev => ({
			...prev,
			siteOrigineId: siteId,
			productId: '',
			actifId: '',
			quantite: '',
			prixUnitaire: '',
			detentaire: '',
			ayant_droit: '',
			siteDestinationId: '',
			observations: ''
		}));
		setMaxTransferQty(null);

		// Filtrer les produits du site choisi
		const siteProducts = actifs.filter(item => {
			const depotSite = allSites.find(site => site.siteName === item.depot);
			return depotSite?._id === siteId;
		});
		setProductsOnSite(siteProducts);
	};

	const handleSelectProduct = productId => {
		const actif = actifs.find(item => item.id === productId);
		setTransferForm(prev => ({
			...prev,
			actifId: actif?.id || '',
			productId: actif?.id || '',
			quantite: '',
			prixUnitaire: actif?.prixUnitaire || '',
			detentaire: actif?.detentaire || '',
			ayant_droit: actif?.ayantDroit || '',
		}));
		setMaxTransferQty(actif?.quantite || null);
	};

	const handleTransferSubmit = async e => {
		e.preventDefault();

		if (!transferForm.siteOrigineId || !transferForm.productId || !transferForm.quantite || !transferForm.siteDestinationId) {
			toast.error('Veuillez remplir tous les champs obligatoires');
			return;
		}

		try {
			const payload = {
				...transferForm,
				quantite: Number(transferForm.quantite),
				prixUnitaire: Number(transferForm.prixUnitaire),
			};

			await withdrawStock(payload);

			toast.success('Transfert effectué');
			setTransferForm({
				actifId: '',
				productId: '',
				siteOrigineId: '',
				siteDestinationId: '',
				quantite: '',
				prixUnitaire: '',
				detentaire: '',
				ayant_droit: '',
				observations: ''
			});
			setProductsOnSite([]);
			setMaxTransferQty(null);
			fetchActifs();
		} catch {
			toast.error('Erreur lors du transfert');
		}
	};

	const handleShowDetail = async id => {
		try {
			setLoadingDetail(true);
			const actif = actifs.find(a => a.id === id);
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
					{/* TABS: Formulaire / Liste */}
					<Tabs defaultValue="form" className="space-y-6">
						<TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
							<TabsTrigger value="form" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Formulaire de transfert</TabsTrigger>
							<TabsTrigger value="list" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Historique de mes actifs</TabsTrigger>
						</TabsList>

						<TabsContent value="form">
							<Card className="border-neutral-200 bg-white">
								<div className="px-4 pt-4">
									<h2 className="text-lg font-semibold text-neutral-900">Formulaire de transfert</h2>
									<p className="text-sm text-neutral-600">Renseignez les informations pour transférer un actif.</p>
								</div>
								<form className="space-y-4 p-4" onSubmit={handleTransferSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* 1. Sélectionner Site d'origine */}
										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="siteOrigineId">1. Site d'origine *</Label>
											<Select value={transferForm.siteOrigineId} onValueChange={handleSelectSiteOrigine}>
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner le site d'origine" />
												</SelectTrigger>
												<SelectContent>
													{allSites.map(site => (
														<SelectItem key={site._id} value={site._id}>
															{site.siteName} - {site.siteAddress}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{/* 2. Parmi les produits du site choisi */}
										{transferForm.siteOrigineId && (
											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="productId">2. Produit du site *</Label>
												<Select value={transferForm.productId} onValueChange={handleSelectProduct}>
													<SelectTrigger disabled={!transferForm.siteOrigineId}>
														<SelectValue placeholder={productsOnSite.length === 0 ? "Aucun produit disponible" : "Sélectionner un produit"} />
													</SelectTrigger>
													<SelectContent>
														{productsOnSite.map(item => (
															<SelectItem key={item.id} value={item.id}>
																{item.productName || '-'} - Qté disponible: {formatThousands(item.quantite)}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}

										{/* 3. Quantité et Prix unitaire */}
										{transferForm.productId && (
											<>
												<div className="space-y-2">
													<Label htmlFor="quantite">3. Quantité *</Label>
													<Input 
														name="quantite" 
														value={transferForm.quantite} 
														onChange={e => setTransferForm(f => ({ ...f, quantite: e.target.value }))} 
														required 
														placeholder="Quantité à transférer" 
														className="border-neutral-300" 
														type="number" 
														min="1" 
														max={maxTransferQty || undefined} 
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="prixUnitaire">3. Prix unitaire *</Label>
													<Input 
														name="prixUnitaire" 
														value={transferForm.prixUnitaire} 
														onChange={e => setTransferForm(f => ({ ...f, prixUnitaire: e.target.value }))} 
														required 
														placeholder="Prix unitaire" 
														className="border-neutral-300" 
														type="number" 
														min="0" 
													/>
												</div>
											</>
										)}

										{/* 4. Détenteur et Ayant droit */}
										{transferForm.productId && (
											<>
												<div className="space-y-2">
													<Label htmlFor="detentaire">4. Détenteur *</Label>
													<Select value={transferForm.detentaire} onValueChange={val => setTransferForm(f => ({ ...f, detentaire: val }))}>
														<SelectTrigger disabled>
															<SelectValue placeholder={transferForm.detentaire ? transferForm.detentaire : 'Rempli automatiquement'} />
														</SelectTrigger>
													</Select>
												</div>
												<div className="space-y-2">
													<Label htmlFor="ayant_droit">4. Ayant droit *</Label>
													<Select value={transferForm.ayant_droit} onValueChange={val => setTransferForm(f => ({ ...f, ayant_droit: val }))}>
														<SelectTrigger disabled>
															<SelectValue placeholder={transferForm.ayant_droit ? transferForm.ayant_droit : 'Rempli automatiquement'} />
														</SelectTrigger>
													</Select>
												</div>
											</>
										)}

										{/* 5. Choisir site de destination */}
										{transferForm.productId && (
											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="siteDestinationId">5. Site de destination *</Label>
												<Select value={transferForm.siteDestinationId} onValueChange={val => setTransferForm(f => ({ ...f, siteDestinationId: val }))}>
													<SelectTrigger>
														<SelectValue placeholder="Sélectionner le site de destination" />
													</SelectTrigger>
													<SelectContent>
																{site.siteName} - {site.siteAddress}
															
														{allSites.map(site => (
															<SelectItem key={site._id} value={site._id}>{site.siteName}</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										)}

										{/* 6. Observation */}
										{transferForm.productId && (
											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="observations">6. Observation</Label>
												<Input 
													name="observations" 
													value={transferForm.observations} 
													onChange={e => setTransferForm(f => ({ ...f, observations: e.target.value }))} 
													placeholder="Observation" 
													className="border-neutral-300" 
												/>
											</div>
										)}
									</div>

									<div className="flex justify-end gap-2">
										<Button variant="outline" type="button" onClick={() => {
											setTransferForm({
												actifId: '',
												productId: '',
												siteOrigineId: '',
												siteDestinationId: '',
												quantite: '',
												prixUnitaire: '',
												detentaire: '',
												ayant_droit: '',
												observations: ''
											});
											setProductsOnSite([]);
											setMaxTransferQty(null);
										}}>
											Annuler
										</Button>
										<Button 
											variant="default" 
											className="bg-violet-600 text-white hover:bg-violet-700" 
											type="submit"
											disabled={!transferForm.siteOrigineId || !transferForm.productId || !transferForm.quantite || !transferForm.siteDestinationId}
										>
											Valider le transfert
										</Button>
									</div>
								</form>
							</Card>
						</TabsContent>

						<TabsContent value="list" className="space-y-4">
							<div className="flex justify-between items-center">
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

							<Card className="border-neutral-200 bg-white">
								<ActifsTableOrList loading={loading} actifs={actifs} dateFormat={dateFormat} isDesktop={isDesktop} onShowDetail={handleShowDetail} />
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
						</TabsContent>
					</Tabs>

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
								<div className="space-y-3 text-sm">
									<div>
										<b>Code produit :</b> {detailActif.productCode || '-'}
									</div>
									<div>
										<b>Produit :</b> {detailActif.productName}
									</div>
									<div>
										<b>Dépôt :</b> {detailActif.depot}
									</div>
									<div>
										<b>Adresse dépôt :</b> {detailActif.depotAdresse || '-'}
									</div>
									<div>
										<b>Quantité :</b> {formatThousands(detailActif.quantite)}
									</div>
									<div>
										<b>Prix unitaire :</b> {formatThousands(detailActif.prixUnitaire)} Ar
									</div>
									<div>
										<b>Valeur totale :</b> {formatThousands(detailActif.valeurTotale)} Ar
									</div>
									<div>
										<b>Détenteur :</b> {detailActif.detentaire || '-'}
									</div>
									<div>
										<b>Ayant droit :</b> {detailActif.ayantDroit || '-'}
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

function ActifsTableOrList({ loading, actifs, dateFormat, isDesktop, onShowDetail }) {
	if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
	if (!actifs || actifs.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun actif trouvé</div>;

	if (isDesktop) {
		return (
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-xs text-neutral-600">Produit</TableHead>
							<TableHead className="text-xs text-neutral-600">Code</TableHead>
							<TableHead className="text-xs text-neutral-600">Image</TableHead>
							<TableHead className="text-xs text-neutral-600">Dépôt</TableHead>
							<TableHead className="text-xs text-neutral-600">Adresse dépôt</TableHead>
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
							<TableRow key={item.id}>
								<TableCell className="text-sm">{item.productName || '-'}</TableCell>
								<TableCell className="text-sm text-neutral-500">{item.productCode || '-'}</TableCell>
								<TableCell>
									{item.productImage ? (
										<img src={getFullMediaUrl(item.productImage)} className="w-12 h-12 rounded object-cover" />
									) : (
										<span className="text-neutral-400">-</span>
									)}
								</TableCell>
								<TableCell className="text-sm">{item.depot || '-'}</TableCell>
								<TableCell className="text-sm">{item.depotAdresse || '-'}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.quantite)}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.prixUnitaire)}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.valeurTotale)}</TableCell>
								<TableCell className="text-sm">{item.detentaire || '-'}</TableCell>
								<TableCell className="text-sm">{item.ayantDroit || '-'}</TableCell>
								<TableCell className="text-sm">{item.dateCreation ? dateFormat(item.dateCreation) : '-'}</TableCell>
								<TableCell className="text-sm text-right">
									<Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id)}>
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
				<Card key={item.id} className="p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded overflow-hidden">
								{item.productImage ? (
									<img src={getFullMediaUrl(item.productImage)} alt={item.productName} className="w-full h-full object-cover" />
								) : (
									<span className="text-neutral-400">-</span>
								)}
							</div>
							<div className="min-w-0">
								<div className="font-medium text-neutral-900 truncate">{item.productName || '-'}</div>
								<div className="text-xs text-neutral-500">{item.productCode || '-'}</div>
								<div className="text-xs text-neutral-500 mt-1">{item.depot || '-'}</div>
							</div>
						</div>
						<div className="flex flex-col items-end gap-2">
							<div className="text-sm font-medium text-neutral-900">Qté: {formatThousands(item.quantite)}</div>
							<div className="text-xs text-neutral-600">PU: {formatThousands(item.prixUnitaire)}</div>
							<div className="text-sm text-neutral-900 font-medium">Total: {formatThousands(item.valeurTotale)}</div>
							<div className="flex gap-2 mt-2">
								<Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id)}><InfoIcon className="w-4 h-4 text-violet-600" /></Button>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}