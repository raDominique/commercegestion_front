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
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getFullMediaUrl } from '../../services/media.service';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
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

		if (!transferForm.siteOrigineId || !transferForm.productId || !transferForm.quantite || !transferForm.siteDestinationId || !transferForm.detentaire || !transferForm.ayant_droit) {
			toast.error('Veuillez remplir tous les champs obligatoires');
			return;
		}

		try {
			const token = getAccessToken();
			if (!token) {
				toast.error('Token d\'authentification manquant');
				return;
			}

			const payload = {
				detentaire: transferForm.detentaire,
				ayant_droit: transferForm.ayant_droit,
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
		}
	};

	return (
		<div className="px-6 mx-auto">
			{user && user.userValidated === false && (
				<UserNotValidatedBanner />
			)}

			<Tabs defaultValue="list" className="space-y-6">
				<TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
					<TabsTrigger value="list" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Historique de mes dépôts</TabsTrigger>
					<TabsTrigger value="form" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Formulaire de dépôt</TabsTrigger>
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

					<div className="flex justify-end items-center gap-4 mt-4">
						<div className="flex items-center gap-2">
							<label htmlFor="depot-limit" className="text-sm text-neutral-600">Par page</label>
							<select
								id="depot-limit"
								className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm"
								value={limit}
								onChange={(e) => {
									setLimit(Number(e.target.value));
									setPage(1);
								}}
							>
								<option value={10}>10</option>
								<option value={20}>20</option>
								<option value={50}>50</option>
								<option value={100}>100</option>
							</select>
						</div>
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
				</TabsContent>

				<TabsContent value="form">
					<Card className="border-neutral-200 bg-white">
						<div className="px-4 pt-4">
							<h2 className="text-lg font-semibold text-neutral-900">Formulaire de dépôt</h2>
							<p className="text-sm text-neutral-600">Renseignez les informations pour déposer un actif.</p>
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
													<SelectItem key={item.productId} value={item.productId}>
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
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner un détenteur" />
												</SelectTrigger>
												<SelectContent>
													{usersOptions.map(user => (
														<SelectItem key={user._id} value={user._id}>
															{user.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-2">
											<Label htmlFor="ayant_droit">4. Ayant droit *</Label>
											<Select value={transferForm.ayant_droit} onValueChange={val => setTransferForm(f => ({ ...f, ayant_droit: val }))}>
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner un ayant droit" />
												</SelectTrigger>
												<SelectContent>
													{usersOptions.map(user => (
														<SelectItem key={user._id} value={user._id}>
															{user.name}
														</SelectItem>
													))}
												</SelectContent>
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
												{detentaireSites.map(site => (
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
							<TableHead className="text-xs text-neutral-600 text-right">Prix unitaire</TableHead>
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
									<TableCell className="text-sm font-semibold text-neutral-900">{item.productId?.productName || '-'}</TableCell>
									<TableCell>
										{item.productId?.productImage ? (
											<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-12 h-12 object-cover rounded" />
										) : (
											<span className="text-neutral-400">-</span>
										)}
									</TableCell>
									<TableCell className="text-sm text-neutral-600">{operatorName}</TableCell>
									<TableCell className="text-sm text-neutral-600">{detenteurName}</TableCell>
									<TableCell className="text-sm text-neutral-600">{ayantDroitName}</TableCell>
									<TableCell className="text-sm text-neutral-600">{item.siteOrigineId?.siteName || '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600">{item.siteDestinationId?.siteName || '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600 text-right">{item.quantite !== undefined && item.quantite !== null ? formatThousands(item.quantite) : '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600 text-right">{item.prixUnitaire !== undefined && item.prixUnitaire !== null ? formatThousands(item.prixUnitaire) : '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600"><Badge variant={validationVariant}>{item.isValide ? 'Validé' : 'Non validé'}</Badge></TableCell>
									<TableCell className="text-sm text-neutral-600">{item.createdAt ? dateFormat(item.createdAt) : '-'}</TableCell>
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
