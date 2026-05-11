import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue
} from '../../components/ui/select';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
import { Badge } from '../../components/ui/badge';
import { formatThousands } from '../../utils/formatNumber';
import { getDeposits } from '../../services/stocks_move.service';
import { depositStockToAMember } from '../../services/transaction.service';
import { getProfile } from '../../services/auth.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { getAllUsersSelect } from '../../services/user.service';
import { getMySites, getActifsBySite, getSitesByUser } from '../../services/site.service';
import { getAccessToken } from '../../services/token.service';

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
	const { isDesktop } = useScreenType();

	// Historique dépôts
	const [actifs, setActifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	// Formulaire dépôt
	const [usersOptions, setUsersOptions] = useState([]);
	const [allSites, setAllSites] = useState([]);
	const [detentaireSites, setDetentaireSites] = useState([]);
	const [productsOnSite, setProductsOnSite] = useState([]);
	const [maxTransferQty, setMaxTransferQty] = useState(null);

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

	// États pour les recherches - Site d'origine
	const [siteOriginSearch, setSiteOriginSearch] = useState('');
	const [siteOriginOpen, setSiteOriginOpen] = useState(false);
	const [siteOriginHighlighted, setSiteOriginHighlighted] = useState(0);

	// États pour les recherches - Produit
	const [productSearch, setProductSearch] = useState('');
	const [productOpen, setProductOpen] = useState(false);
	const [productHighlighted, setProductHighlighted] = useState(0);

	// États pour les recherches - Détentaire
	const [detentaireSearch, setDetentaireSearch] = useState('');
	const [detentaireOpen, setDetentaireOpen] = useState(false);
	const [detentaireHighlighted, setDetentaireHighlighted] = useState(0);

	// États pour les recherches - Ayant droit
	const [ayantDroitSearch, setAyantDroitSearch] = useState('');
	const [ayantDroitOpen, setAyantDroitOpen] = useState(false);
	const [ayantDroitHighlighted, setAyantDroitHighlighted] = useState(0);

	// États pour les recherches - Site de destination
	const [siteDestinationSearch, setSiteDestinationSearch] = useState('');
	const [siteDestinationOpen, setSiteDestinationOpen] = useState(false);
	const [siteDestinationHighlighted, setSiteDestinationHighlighted] = useState(0);
	// Estado para o formulário de transferência
	const [saving, setSaving] = useState(false);
	// Données filtrées
	const filteredOriginSites = allSites.filter(site => site.siteName.toLowerCase().includes(siteOriginSearch.toLowerCase()));
	const filteredProducts = productsOnSite.filter(item => (item.productName || '').toLowerCase().includes(productSearch.toLowerCase()));
	const filteredDetentaires = usersOptions.filter(user => user.name.toLowerCase().includes(detentaireSearch.toLowerCase()));
	const filteredAyantDroits = usersOptions.filter(user => user.name.toLowerCase().includes(ayantDroitSearch.toLowerCase()));
	const filteredDestinationSites = detentaireSites.filter(site => site.siteName.toLowerCase().includes(siteDestinationSearch.toLowerCase()));

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

	// Charger les données du formulaire
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

	// Charger les sites du détentaire sélectionné
	useEffect(() => {
		if (transferForm.detentaire) {
			getSitesByUser(transferForm.detentaire)
				.then(res => {
					let sites = [];
					if (Array.isArray(res)) {
						sites = res;
					} else if (res?.data && Array.isArray(res.data)) {
						sites = res.data;
					}
					setDetentaireSites(sites);
				})
				.catch(error => {
					console.error('Erreur lors de la récupération des sites du détentaire:', error);
					toast.error('Erreur lors du chargement des sites du détentaire');
					setDetentaireSites([]);
				});
		} else {
			setDetentaireSites([]);
		}
	}, [transferForm.detentaire]);

	/* ================= ACTIONS ================= */

	const handleSelectSiteOrigine = async siteId => {
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

		try {
			const res = await getActifsBySite(siteId);
			let siteProducts = [];
			if (Array.isArray(res)) {
				siteProducts = res;
			} else if (res?.data && Array.isArray(res.data)) {
				siteProducts = res.data;
			}
			setProductsOnSite(siteProducts);
			if (siteProducts.length > 0) {
				toast.success(`${siteProducts.length} actif(s) chargé(s)`);
			} else {
				toast.info('Aucun actif sur ce site');
			}
		} catch (error) {
			console.error('Erreur lors de la récupération des actifs:', error);
			toast.error('Erreur lors du chargement des actifs du site');
			setProductsOnSite([]);
		}
	};

	const handleSelectProduct = productId => {
		const actif = productsOnSite.find(item => item.productId === productId);
		setTransferForm(prev => ({
			...prev,
			actifId: actif?.productId || '',
			productId: actif?.productId || '',
			quantite: '',
			prixUnitaire: actif?.prixUnitaire || '',
			detentaire: '',
			ayant_droit: '',
		}));
		setMaxTransferQty(actif?.quantite || null);
	};

	const handleTransferSubmit = async e => {
		e.preventDefault();

		if (!transferForm.siteOrigineId || !transferForm.productId || !transferForm.quantite || !transferForm.siteDestinationId || !transferForm.detentaire) {
			toast.error('Veuillez remplir tous les champs obligatoires');
			return;
		}

		try {
			setSaving(true);
			const token = getAccessToken();
			if (!token) {
				toast.error('Token d\'authentification manquant');
				return;
			}

			// Resolve ayant_droit: prefer currently authenticated user's id, fallback to profile, then form value
			let ayantDroitId = (user && (user._id || user.id)) || transferForm.ayant_droit;
			if (!ayantDroitId) {
				try {
					const profile = await getProfile();
					ayantDroitId = profile?._id || profile?.id || ayantDroitId;
				} catch (err) {
					console.debug('Impossible de récupérer le profil pour ayant_droit:', err);
				}
			}

			if (!ayantDroitId) {
				toast.error("Ayant droit introuvable");
				return;
			}

			const payload = {
				detentaire: transferForm.detentaire,
				ayant_droit: ayantDroitId,
				productId: transferForm.productId,
				siteOrigineId: transferForm.siteOrigineId,
				siteDestinationId: transferForm.siteDestinationId,
				quantite: Number(transferForm.quantite),
				prixUnitaire: Number(transferForm.prixUnitaire),
				observations: transferForm.observations || '',
			};

			await depositStockToAMember(payload, token);

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
		} catch (error) {
			console.error('Erreur lors du transfert:', error);
			toast.error('Erreur lors du transfert');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="px-6 mx-auto">
			{user && user.userValidated === false && (
				<UserNotValidatedBanner />
			)}

		<Tabs defaultValue="list">
			<TabsList>
				<TabsTrigger value="list">Historique de mes dépôts</TabsTrigger>
				<TabsTrigger value="form">Formulaire de dépôt</TabsTrigger>
				</TabsList>
				<TabsContent value="list" className="space-y-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl text-neutral-900 mb-2">Mes Dépôts</h1>
							<p className="text-sm text-neutral-600">Historique de vos dépôts</p>
						</div>
					</div>

					<Card className="border-neutral-200 bg-white">
						<DepotTableOrList loading={loading} actifs={actifs} dateFormat={dateFormat} />
					</Card>

					<PaginationControls
						page={page}
						total={total}
						limit={limit}
						loading={loading}
						onPageChange={setPage}
						onLimitChange={setLimit}
						showLimitSelector
						limitLabel="Par page"
						className="mt-4"
					/>
				</TabsContent>

				<TabsContent value="form">
					<Card className="border-neutral-200 bg-white">
						<div className="px-4 pt-4">
							<h2 className="text-lg font-semibold text-neutral-900">Formulaire de dépôt</h2>
							<p className="text-sm text-neutral-600">Renseignez les informations pour déposer un actif.</p>
						</div>
						<form className="space-y-4 p-4" onSubmit={handleTransferSubmit}>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* 1. Site d'origine avec recherche */}
								<div className="space-y-2 md:col-span-2">
									<Label required>1. Site d'origine</Label>
									<div className="relative">
										<Input
											placeholder="Rechercher le site d'origine..."
											value={siteOriginSearch}
											onChange={e => { setSiteOriginSearch(e.target.value); setSiteOriginHighlighted(0); }}
											onFocus={() => { setSiteOriginOpen(true); setSiteOriginHighlighted(0); }}
											onBlur={() => setTimeout(() => setSiteOriginOpen(false), 150)}
											onKeyDown={(e) => {
												if (e.key === 'Escape') return setSiteOriginOpen(false);
												if (!siteOriginOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
													setSiteOriginOpen(true);
													e.preventDefault();
													return;
												}
												if (siteOriginOpen) {
													if (e.key === 'ArrowDown') {
														e.preventDefault();
														setSiteOriginHighlighted(i => Math.min(i + 1, Math.max(filteredOriginSites.length - 1, 0)));
													} else if (e.key === 'ArrowUp') {
														e.preventDefault();
														setSiteOriginHighlighted(i => Math.max(i - 1, 0));
													} else if (e.key === 'Enter') {
														e.preventDefault();
														const site = filteredOriginSites[siteOriginHighlighted];
														if (site) {
															handleSelectSiteOrigine(site._id);
															setSiteOriginSearch(site.siteName);
															setSiteOriginOpen(false);
														}
													}
												}
											}}
											className="w-full"
										/>
										{siteOriginOpen && (
											<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
												{filteredOriginSites.length > 0 ? (
													filteredOriginSites.map((site, idx) => (
														<button
															type="button"
															key={site._id}
															onMouseEnter={() => setSiteOriginHighlighted(idx)}
															onClick={() => {
																handleSelectSiteOrigine(site._id);
																setSiteOriginSearch(site.siteName);
																setSiteOriginOpen(false);
															}}
															className={`w-full text-left px-3 py-2 text-sm ${idx === siteOriginHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
														>
															{site.siteName} - {site.siteAddress || ''}
														</button>
													))
												) : (
													<div className="px-3 py-2 text-sm text-neutral-500">Aucun site trouvé</div>
												)}
											</div>
										)}
									</div>
								</div>

								{/* 2. Produit du site avec recherche */}
								{transferForm.siteOrigineId && (
									<div className="space-y-2 md:col-span-2">
										<Label required>2. Produit du site</Label>
										<div className="relative">
											<Input
												placeholder={productsOnSite.length === 0 ? "Aucun produit disponible" : "Rechercher un produit..."}
												value={productSearch}
												onChange={e => { setProductSearch(e.target.value); setProductHighlighted(0); }}
												onFocus={() => { setProductOpen(true); setProductHighlighted(0); }}
												onBlur={() => setTimeout(() => setProductOpen(false), 150)}
												onKeyDown={(e) => {
													if (e.key === 'Escape') return setProductOpen(false);
													if (!productOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
														setProductOpen(true);
														e.preventDefault();
														return;
													}
													if (productOpen) {
														if (e.key === 'ArrowDown') {
															e.preventDefault();
															setProductHighlighted(i => Math.min(i + 1, Math.max(filteredProducts.length - 1, 0)));
														} else if (e.key === 'ArrowUp') {
															e.preventDefault();
															setProductHighlighted(i => Math.max(i - 1, 0));
														} else if (e.key === 'Enter') {
															e.preventDefault();
															const product = filteredProducts[productHighlighted];
															if (product) {
																handleSelectProduct(product.productId);
																setProductSearch(product.productName);
																setProductOpen(false);
															}
														}
													}
												}}
												className="w-full"
												disabled={productsOnSite.length === 0}
											/>
											{productOpen && filteredProducts.length > 0 && (
												<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
													{filteredProducts.map((item, idx) => (
														<button
															type="button"
															key={item.productId}
															onMouseEnter={() => setProductHighlighted(idx)}
															onClick={() => {
																handleSelectProduct(item.productId);
																setProductSearch(item.productName);
																setProductOpen(false);
															}}
															className={`w-full text-left px-3 py-2 text-sm ${idx === productHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
														>
															{item.productName || '-'} - Qté: {formatThousands(item.quantite)}
														</button>
													))}
												</div>
											)}
										</div>
									</div>
								)}

								{/* 3. Quantité et Prix unitaire */}
								{transferForm.productId && (
									<>
										<div className="space-y-2">
											<Label required>3. Quantité (Stock disponible: {formatThousands(maxTransferQty || 0)})</Label>
											<Input
												name="quantite"
												value={transferForm.quantite}
												onChange={e => {
													const qty = Number(e.target.value);
													if (qty <= (maxTransferQty || 0) || e.target.value === '') {
														setTransferForm(f => ({ ...f, quantite: e.target.value }));
													}
												}}
												required
												placeholder="Quantité à transférer"
												className="border-neutral-300"
												type="number"
												min="1"
												max={maxTransferQty || undefined}
											/>
										</div>
										{/* <div className="space-y-2">
											<Label required>3. Prix unitaire</Label>
											<Input
												name="prixUnitaire"
												value={transferForm.prixUnitaire ? formatThousands(transferForm.prixUnitaire) : ''}
												readOnly
												disabled
												required
												placeholder="Défini automatiquement"
												className="border-neutral-300 bg-neutral-100"
												type="text"
											/>
										</div> */}
									</>
								)}

								{/* 4. Détenteur avec recherche */}
								{transferForm.productId && (
									<div className="space-y-2">
										<Label required>4. Détenteur</Label>
										<div className="relative">
											<Input
												placeholder="Rechercher un détenteur..."
												value={detentaireSearch}
												onChange={e => { setDetentaireSearch(e.target.value); setDetentaireHighlighted(0); }}
												onFocus={() => { setDetentaireOpen(true); setDetentaireHighlighted(0); }}
												onBlur={() => setTimeout(() => setDetentaireOpen(false), 150)}
												onKeyDown={(e) => {
													if (e.key === 'Escape') return setDetentaireOpen(false);
													if (!detentaireOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
														setDetentaireOpen(true);
														e.preventDefault();
														return;
													}
													if (detentaireOpen) {
														if (e.key === 'ArrowDown') {
															e.preventDefault();
															setDetentaireHighlighted(i => Math.min(i + 1, Math.max(filteredDetentaires.length - 1, 0)));
														} else if (e.key === 'ArrowUp') {
															e.preventDefault();
															setDetentaireHighlighted(i => Math.max(i - 1, 0));
														} else if (e.key === 'Enter') {
															e.preventDefault();
															const user = filteredDetentaires[detentaireHighlighted];
															if (user) {
																setTransferForm(f => ({ ...f, detentaire: user._id }));
																setDetentaireSearch(user.name);
																setDetentaireOpen(false);
															}
														}
													}
												}}
												className="w-full"
											/>
											{detentaireOpen && (
												<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
													{filteredDetentaires.length > 0 ? (
														filteredDetentaires.map((user, idx) => (
															<button
																type="button"
																key={user._id}
																onMouseEnter={() => setDetentaireHighlighted(idx)}
																onClick={() => {
																	setTransferForm(f => ({ ...f, detentaire: user._id }));
																	setDetentaireSearch(user.name);
																	setDetentaireOpen(false);
																}}
																className={`w-full text-left px-3 py-2 text-sm ${idx === detentaireHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
															>
																{user.name}
															</button>
														))
													) : (
														<div className="px-3 py-2 text-sm text-neutral-500">Aucun utilisateur trouvé</div>
													)}
												</div>
											)}
										</div>
									</div>
								)}

								{/* 4. Ayant droit avec recherche */}
								{/* {transferForm.productId && (
									<div className="space-y-2">
									<Label required>4. Ayant droit</Label>
										<div className="relative">
											<Input
												placeholder="Rechercher l'ayant droit..."
												value={ayantDroitSearch}
												onChange={e => { setAyantDroitSearch(e.target.value); setAyantDroitHighlighted(0); }}
												onFocus={() => { setAyantDroitOpen(true); setAyantDroitHighlighted(0); }}
												onBlur={() => setTimeout(() => setAyantDroitOpen(false), 150)}
												onKeyDown={(e) => {
													if (e.key === 'Escape') return setAyantDroitOpen(false);
													if (!ayantDroitOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
														setAyantDroitOpen(true);
														e.preventDefault();
														return;
													}
													if (ayantDroitOpen) {
														if (e.key === 'ArrowDown') {
															e.preventDefault();
															setAyantDroitHighlighted(i => Math.min(i + 1, Math.max(filteredAyantDroits.length - 1, 0)));
														} else if (e.key === 'ArrowUp') {
															e.preventDefault();
															setAyantDroitHighlighted(i => Math.max(i - 1, 0));
														} else if (e.key === 'Enter') {
															e.preventDefault();
															const user = filteredAyantDroits[ayantDroitHighlighted];
															if (user) {
																setTransferForm(f => ({ ...f, ayant_droit: user._id }));
																setAyantDroitSearch(user.name);
																setAyantDroitOpen(false);
															}
														}
													}
												}}
												className="w-full"
											/>
											{ayantDroitOpen && (
												<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
													{filteredAyantDroits.length > 0 ? (
														filteredAyantDroits.map((user, idx) => (
															<button
																type="button"
																key={user._id}
																onMouseEnter={() => setAyantDroitHighlighted(idx)}
																onClick={() => {
																	setTransferForm(f => ({ ...f, ayant_droit: user._id }));
																	setAyantDroitSearch(user.name);
																	setAyantDroitOpen(false);
																}}
																className={`w-full text-left px-3 py-2 text-sm ${idx === ayantDroitHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
															>
																{user.name}
															</button>
														))
													) : (
														<div className="px-3 py-2 text-sm text-neutral-500">Aucun utilisateur trouvé</div>
													)}
												</div>
											)}
										</div>
									</div>
								)} */}

								{/* 5. Site de destination avec recherche */}
								{transferForm.productId && (
									<div className="space-y-2 md:col-span-2">
									<Label required>5. Site de destination</Label>
										<div className="relative">
											<Input
												placeholder="Rechercher le site de destination..."
												value={siteDestinationSearch}
												onChange={e => { setSiteDestinationSearch(e.target.value); setSiteDestinationHighlighted(0); }}
												onFocus={() => { setSiteDestinationOpen(true); setSiteDestinationHighlighted(0); }}
												onBlur={() => setTimeout(() => setSiteDestinationOpen(false), 150)}
												onKeyDown={(e) => {
													if (e.key === 'Escape') return setSiteDestinationOpen(false);
													if (!siteDestinationOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
														setSiteDestinationOpen(true);
														e.preventDefault();
														return;
													}
													if (siteDestinationOpen) {
														if (e.key === 'ArrowDown') {
															e.preventDefault();
															setSiteDestinationHighlighted(i => Math.min(i + 1, Math.max(filteredDestinationSites.length - 1, 0)));
														} else if (e.key === 'ArrowUp') {
															e.preventDefault();
															setSiteDestinationHighlighted(i => Math.max(i - 1, 0));
														} else if (e.key === 'Enter') {
															e.preventDefault();
															const site = filteredDestinationSites[siteDestinationHighlighted];
															if (site) {
																setTransferForm(f => ({ ...f, siteDestinationId: site._id }));
																setSiteDestinationSearch(site.siteName);
																setSiteDestinationOpen(false);
															}
														}
													}
												}}
												className="w-full"
											/>
											{siteDestinationOpen && (
												<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
													{filteredDestinationSites.length > 0 ? (
														filteredDestinationSites.map((site, idx) => (
															<button
																type="button"
																key={site._id}
																onMouseEnter={() => setSiteDestinationHighlighted(idx)}
																onClick={() => {
																	setTransferForm(f => ({ ...f, siteDestinationId: site._id }));
																	setSiteDestinationSearch(site.siteName);
																	setSiteDestinationOpen(false);
																}}
																className={`w-full text-left px-3 py-2 text-sm ${idx === siteDestinationHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
															>
																{site.siteName}
															</button>
														))
													) : (
														<div className="px-3 py-2 text-sm text-neutral-500">Aucun site trouvé</div>
													)}
												</div>
											)}
										</div>
									</div>
								)}

								{/* 6. Observation */}
								{transferForm.productId && (
									<div className="space-y-2 md:col-span-2">
										<Label>6. Observation</Label>
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
									setSiteOriginSearch('');
									setProductSearch('');
									setDetentaireSearch('');
									setAyantDroitSearch('');
									setSiteDestinationSearch('');
									setProductsOnSite([]);
									setMaxTransferQty(null);
								}}>
									Annuler
								</Button>
								<Button
									variant="default"
									status={saving ? 'loading' : 'active'}
									color="default"
									type="submit"
									disabled={!transferForm.siteOrigineId || !transferForm.productId || !transferForm.quantite || !transferForm.siteDestinationId || !transferForm.detentaire}
								>
									Valider le transfert
								</Button>
							</div>
						</form>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default Depot;

function DepotTableOrList({ loading, actifs, dateFormat }) {
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
							{/* <TableHead className="text-xs text-neutral-600 text-right">Prix unitaire</TableHead> */}
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
									<TableCell className="text-sm">{item.productId?.productName || '-'}</TableCell>
									<TableCell>
										{item.productId?.productImage ? (
											<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-12 h-12 object-cover rounded" />
										) : (
											<span className="text-neutral-400">-</span>
										)}
									</TableCell>
									<TableCell className="text-sm">{operatorName}</TableCell>
									<TableCell className="text-sm">{detenteurName}</TableCell>
									<TableCell className="text-sm">{ayantDroitName}</TableCell>
									<TableCell className="text-sm">{item.siteOrigineId?.siteName || '-'}</TableCell>
									<TableCell className="text-sm">{item.siteDestinationId?.siteName || '-'}</TableCell>
									<TableCell className="text-sm text-right">{item.quantite !== undefined && item.quantite !== null ? formatThousands(item.quantite) : '-'}</TableCell>
									{/* <TableCell className="text-sm text-right">{item.prixUnitaire !== undefined && item.prixUnitaire !== null ? formatThousands(item.prixUnitaire) : '-'}</TableCell> */}
									<TableCell className="text-sm"><Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge></TableCell>
									<TableCell className="text-sm">{item.createdAt ? dateFormat(item.createdAt) : '-'}</TableCell>
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
									</div>
								</div>
								<div className="grid grid-cols-2 gap-2 mt-3 text-xs">
									<div>
										<span className="text-neutral-600">Opérateur:</span>
										<div className="font-medium text-neutral-900">{operatorName}</div>
									</div>
									<div>
										<span className="text-neutral-600">Détenteur:</span>
										<div className="font-medium text-neutral-900">{detenteurName}</div>
									</div>
									<div>
										<span className="text-neutral-600">Quantité:</span>
										<div className="font-medium text-neutral-900">{item.quantite !== undefined && item.quantite !== null ? formatThousands(item.quantite) : '-'}</div>
									</div>
									<div>
										<span className="text-neutral-600">Prix unitaire:</span>
										<div className="font-medium text-neutral-900">{item.prixUnitaire !== undefined && item.prixUnitaire !== null ? formatThousands(item.prixUnitaire) : '-'}</div>
									</div>
								</div>
								<div className="mt-2">
									<Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge>
								</div>
							</div>
							<div className="text-xs text-neutral-500 text-right">
								{item.createdAt ? dateFormat(item.createdAt) : '-'}
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
