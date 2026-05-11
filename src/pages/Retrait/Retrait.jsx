import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
import { Badge } from '../../components/ui/badge';
import { formatThousands } from '../../utils/formatNumber';
import { depositStockToAMember } from '../../services/transaction.service';
import { getWithdrawals } from '../../services/stocks_move.service.js';
import { getFullMediaUrl } from '../../services/media.service';
import { getAllUsersSelect } from '../../services/user.service';
import { getSitesByUser, getActifsBySite } from '../../services/site.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { getProfile } from '../../services/auth.service.js';
import { getAccessToken } from '../../services/token.service';
import { toast } from 'sonner';

const Retrait = () => {
	const { user } = useAuth();
	const dateFormat = useDateFormat();
	const { isDesktop } = useScreenType();
	usePageTitle('Retrait');

	// États pour l'historique
	const [passifs, setPassifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	// États pour le formulaire de retrait
	const [usersOptions, setUsersOptions] = useState([]);
	const [detentaireSites, setDetentaireSites] = useState([]);
	const [productsOnSite, setProductsOnSite] = useState([]);
	const [maxWithdrawalQty, setMaxWithdrawalQty] = useState(null);
	
	const [withdrawalForm, setWithdrawalForm] = useState({
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

	// États pour les recherches - Détentaire
	const [detentaireSearch, setDetentaireSearch] = useState('');
	const [detentaireOpen, setDetentaireOpen] = useState(false);
	const [detentaireHighlighted, setDetentaireHighlighted] = useState(0);

	// États pour les recherches - Site d'origine
	const [siteOriginSearch, setSiteOriginSearch] = useState('');
	const [siteOriginOpen, setSiteOriginOpen] = useState(false);
	const [siteOriginHighlighted, setSiteOriginHighlighted] = useState(0);

	// États pour les recherches - Produit
	const [productSearch, setProductSearch] = useState('');
	const [productOpen, setProductOpen] = useState(false);
	const [productHighlighted, setProductHighlighted] = useState(0);

	// État pour les transferts
	const [saving, setSaving] = useState(false);

	// Données filtrées
	const filteredDetentaires = usersOptions.filter(user => user.name.toLowerCase().includes(detentaireSearch.toLowerCase()));
	const filteredOriginSites = detentaireSites.filter(site => site.siteName.toLowerCase().includes(siteOriginSearch.toLowerCase()));
	const filteredProducts = productsOnSite.filter(item => (item.productName || '').toLowerCase().includes(productSearch.toLowerCase()));

	// Récupérer l'historique des retraits
	const fetchPassifs = async () => {
		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const params = { limit, page };
			const res = await getWithdrawals(params, token);

			const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
			const totalCount = Number(res?.pagination?.total ?? res?.total ?? items.length);
			setPassifs(items);
			setTotal(Number.isFinite(totalCount) ? totalCount : 0);
		} catch (err) {
			setPassifs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPassifs();
	}, [page, limit]);

	// Charger les utilisateurs au chargement initial
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
	}, []);

	// Charger les sites du détentaire sélectionné
	useEffect(() => {
		if (withdrawalForm.detentaire) {
			getSitesByUser(withdrawalForm.detentaire)
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
	}, [withdrawalForm.detentaire]);

	/* ================= ACTIONS ================= */

	const handleSelectDetentaire = detentaireId => {
		setWithdrawalForm(prev => ({
			...prev,
			detentaire: detentaireId,
			siteOrigineId: '',
			productId: '',
			actifId: '',
			quantite: '',
			siteDestinationId: '',
			observations: ''
		}));
		setDetentaireSites([]);
		setProductsOnSite([]);
		setMaxWithdrawalQty(null);
	};

	const handleSelectSiteOrigine = async siteId => {
		setWithdrawalForm(prev => ({
			...prev,
			siteOrigineId: siteId,
			productId: '',
			actifId: '',
			quantite: '',
			siteDestinationId: '',
			observations: ''
		}));
		setMaxWithdrawalQty(null);

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
		setWithdrawalForm(prev => ({
			...prev,
			actifId: actif?.productId || '',
			productId: actif?.productId || '',
			quantite: '',
			prixUnitaire: actif?.prixUnitaire || '',
		}));
		setMaxWithdrawalQty(actif?.quantite || null);
	};

	const handleSelectPassifForWithdrawal = passifId => {
		const item = passifsList.find(p => p._id === passifId);

		setWithdrawalForm({
			actifId: passifId,
			productId: item?.productId?._id || item?.productId || '',
			siteOrigineId: item?.departDeId || item?.siteOrigineId?._id || item?.siteOriginId?._id || '',
			siteDestinationId: '',
			quantite: '',
			prixUnitaire: item?.prixUnitaire || '',
			detentaire: '',
			ayant_droit: '',
			observations: ''
		});

		setMaxWithdrawalQty(item?.quantite || item?.solde || undefined);
	};

	const handleWithdrawalSubmit = async e => {
		e.preventDefault();

		if (!withdrawalForm.detentaire || !withdrawalForm.siteOrigineId || !withdrawalForm.productId || !withdrawalForm.quantite) {
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
			let ayantDroitId = (user && (user._id || user.id)) || withdrawalForm.ayant_droit;
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
				detentaire: withdrawalForm.detentaire,
				ayant_droit: ayantDroitId,
				productId: withdrawalForm.productId,
				siteOrigineId: withdrawalForm.siteOrigineId,
				siteDestinationId: withdrawalForm.siteDestinationId || withdrawalForm.siteOrigineId,
				quantite: Number(withdrawalForm.quantite),
				prixUnitaire: withdrawalForm.prixUnitaire !== '' ? Number(withdrawalForm.prixUnitaire) : null,
				observations: withdrawalForm.observations || '',
			};

			await depositStockToAMember(payload, token);
			setWithdrawalForm({
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
			setDetentaireSites([]);
			setProductsOnSite([]);
			setMaxWithdrawalQty(null);
			setSiteOriginSearch('');
			setProductSearch('');
			setDetentaireSearch('');
			toast.success('Retrait effectué avec succès');
			fetchPassifs();
		} catch (error) {
			console.error('Erreur lors du retrait du stock:', error);
			toast.error('Erreur lors du retrait du stock');
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="px-6 mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<>
				<Tabs defaultValue="list">
					<TabsList>
						<TabsTrigger value="list">Historique de mes retraits</TabsTrigger>
						<TabsTrigger value="form">Formulaire de retrait</TabsTrigger>
						</TabsList>

						<TabsContent value="list" className="space-y-6">
							<div className="space-y-6">
								<div>
									<h1 className="text-2xl text-neutral-900 mb-2">Mes Retraits</h1>
									<p className="text-sm text-neutral-600">Historique de vos retraits</p>
								</div>

								{/* TABLEAU */}
								<Card className="border-neutral-200 bg-white">
									<RetraitTableOrList loading={loading} passifs={passifs} dateFormat={dateFormat} isDesktop={isDesktop} />
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
							</div>
						</TabsContent>

						<TabsContent value="form">
							<Card className="border-neutral-200 bg-white">
								<div className="px-4 pt-4">
									<h2 className="text-lg font-semibold text-neutral-900">Formulaire de retrait</h2>
									<p className="text-sm text-neutral-600">Renseignez les informations pour retirer un actif.</p>
								</div>
								<form className="space-y-4 p-4" onSubmit={handleWithdrawalSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{/* 1. Détentaire avec recherche */}
										<div className="space-y-2 md:col-span-2">
											<Label required>1. Détentaire</Label>
											<div className="relative">
												<Input
													placeholder="Rechercher un détentaire..."
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
																	handleSelectDetentaire(user._id);
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
																		handleSelectDetentaire(user._id);
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

										{/* 2. Site d'origine avec recherche */}
										{withdrawalForm.detentaire && (
											<div className="space-y-2 md:col-span-2">
												<Label required>2. Site du détentaire</Label>
												<div className="relative">
													<Input
														placeholder={detentaireSites.length === 0 ? "Aucun site disponible" : "Rechercher le site..."}
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
														disabled={detentaireSites.length === 0}
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
										)}

										{/* 3. Produit du site avec recherche */}
										{withdrawalForm.siteOrigineId && (
											<div className="space-y-2 md:col-span-2">
												<Label required>3. Actif à retirer</Label>
												<div className="relative">
													<Input
														placeholder={productsOnSite.length === 0 ? "Aucun actif disponible" : "Rechercher un actif..."}
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

										{/* 4. Quantité */}
										{withdrawalForm.productId && (
											<div className="space-y-2 md:col-span-2">
												<Label required>4. Quantité (Stock disponible: {formatThousands(maxWithdrawalQty || 0)})</Label>
												<Input
													name="quantite"
													value={withdrawalForm.quantite}
													onChange={e => {
														const qty = Number(e.target.value);
														if (qty <= (maxWithdrawalQty || 0) || e.target.value === '') {
															setWithdrawalForm(f => ({ ...f, quantite: e.target.value }));
														}
													}}
													required
													placeholder="Quantité à retirer"
													className="border-neutral-300"
													type="number"
													min="1"
													max={maxWithdrawalQty || undefined}
												/>
											</div>
										)}

										{/* 5. Observation */}
										{withdrawalForm.productId && (
											<div className="space-y-2 md:col-span-2">
												<Label>5. Observation</Label>
												<Input
													name="observations"
													value={withdrawalForm.observations}
													onChange={e => setWithdrawalForm(f => ({ ...f, observations: e.target.value }))}
													placeholder="Observation"
													className="border-neutral-300"
												/>
											</div>
										)}
									</div>

									<div className="flex justify-end gap-2">
										<Button variant="outline" type="button" onClick={() => {
											setWithdrawalForm({
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
											setDetentaireSearch('');
											setSiteOriginSearch('');
											setProductSearch('');
											setDetentaireSites([]);
											setProductsOnSite([]);
											setMaxWithdrawalQty(null);
										}}>
											Annuler
										</Button>
										<Button
											variant="default"
											status={saving ? 'loading' : 'active'}
											color="default"
											type="submit"
											disabled={!withdrawalForm.detentaire || !withdrawalForm.siteOrigineId || !withdrawalForm.productId || !withdrawalForm.quantite}
										>
											Valider le retrait
										</Button>
									</div>
								</form>
							</Card>
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	);
};

function RetraitTableOrList({ loading, passifs, dateFormat, isDesktop }) {

	if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
	if (!passifs || passifs.length === 0)
		return <div className="p-8 text-center text-neutral-400">Aucun retrait trouvé</div>;

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
							<TableHead className="text-xs text-neutral-600">Départ</TableHead>
							<TableHead className="text-xs text-neutral-600">Arrivée</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Quantité</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Prix unitaire</TableHead>
							<TableHead className="text-xs text-neutral-600">Validation</TableHead>
							<TableHead className="text-xs text-neutral-600">Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{passifs.map((item) => {
							const produit = item.productId?.productName || item.productId?.codeCPC || '-';
							const quantite = item.quantite ?? '-';
							const prixUnitaire = item.prixUnitaire ?? null;
							const depart = item.siteOrigineId?.siteName || item.siteOrigineId || '-';
							const arrivee = item.siteDestinationId?.siteName || item.siteDestinationId || '-';
							const operatorName = item.operatorId?.userNickName || item.operatorId?.userName || '-';
							const detenteur = item.detentaire?.userNickName || item.detentaire?.userName || '-';
							const ayantDroit = item.ayant_droit?.userNickName || item.ayant_droit?.userName || '-';
							const date = item.createdAt;
							const validationVariant = item.isValide ? 'default' : 'secondary';

							return (
								<TableRow key={item._id}>
									<TableCell className="text-sm truncate max-w-xs">{produit}</TableCell>
									<TableCell>
										{item.productId?.productImage ? (
											<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-12 h-12 object-cover rounded" />
										) : (
											<span className="text-neutral-400">-</span>
										)}
									</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{operatorName}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{detenteur}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{ayantDroit}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{depart}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{arrivee}</TableCell>
									<TableCell className="text-sm text-right">{quantite !== undefined && quantite !== null ? formatThousands(quantite) : '-'}</TableCell>
									<TableCell className="text-sm text-right">{prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</TableCell>
									<TableCell className="text-sm"><Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge></TableCell>
									<TableCell className="text-sm">{date ? dateFormat(date) : '-'}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="space-y-3 p-4">
			{passifs.map((item) => {
				const produit = item.productId?.productName || item.productId?.codeCPC || '-';
				const quantite = item.quantite ?? '-';
				const prixUnitaire = item.prixUnitaire ?? null;
				const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
				const depart = item.siteOrigineId?.siteName || item.siteOrigineId || '-';
				const arrivee = item.siteDestinationId?.siteName || item.siteDestinationId || '-';
				const operatorName = item.operatorId?.userNickName || item.operatorId?.userName || '-';
				const detenteur = item.detentaire?.userNickName || item.detentaire?.userName || '-';
				const ayantDroit = item.ayant_droit?.userNickName || item.ayant_droit?.userName || '-';
				const date = item.createdAt;
				const validationVariant = item.isValide ? 'default' : 'secondary';

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
										<div className="font-medium text-neutral-900 truncate">{produit}</div>
										<div className="text-xs text-neutral-500 truncate">{depart}</div>
										<div className="text-xs text-neutral-500 truncate">{arrivee}</div>
									</div>
								</div>
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<div className="text-sm text-neutral-900">Quantité: {quantite !== undefined && quantite !== null ? formatThousands(quantite) : '-'}</div>
									<div className="text-sm text-neutral-600">Prix: {prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</div>
									<div className="text-sm text-neutral-600">Opérateur: {operatorName}</div>
									<div className="text-sm text-neutral-600">Détenteur: {detenteur}</div>
									<div className="text-sm text-neutral-600">Ayant droit: {ayantDroit}</div>
									<div className="text-sm text-neutral-600"><Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge></div>
									<div className="text-sm text-neutral-600">Montant: {montant !== null ? formatThousands(montant) : '-'}</div>
									<div className="text-sm text-neutral-600">{date ? dateFormat(date) : '-'}</div>
								</div>
							</div>
							<div className="flex flex-col items-end gap-2">
								<Button variant="ghost" size="sm" aria-label={`Détail ${item._id}`}>
									<InfoIcon className="w-5 h-5 text-violet-600" />
								</Button>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}

export default Retrait;