import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getActifs } from '../../services/ledger.service';
import { getActifById } from '../../services/actifs.service';
import { getProfile } from '../../services/auth.service';
import { initializeTransaction } from '../../services/transaction.service';
import { selectAllProduits } from '../../services/product.service';
import { getMySites } from '../../services/site.service';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription
} from '../../components/ui/dialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import InfoIcon from '@mui/icons-material/Info';
import AddHomeIcon from '@mui/icons-material/AddHome';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useScreenType from '../../utils/useScreenType';
import { getFullMediaUrl } from '../../services/media.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';

const renderPerson = (person) => {
	if (!person) return '-';
	if (typeof person === 'string') return person;
	if (person.userNickName) return person.userNickName;
	if (person.userName) return person.userName;
	if (person.name) return person.name;
	return '-';
};

const Actifs = () => {
	usePageTitle('Actifs');

	const { user } = useAuth();
	const dateFormat = useDateFormat();

	const { isDesktop } = useScreenType();

	const [actifs, setActifs] = useState([]);

	const [loading, setLoading] = useState(false);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const limit = 10;
	const [total, setTotal] = useState(0);

	const [detailOpen, setDetailOpen] = useState(false);

	const [detailActif, setDetailActif] = useState(null);


	const [stockModalOpen, setStockModalOpen] = useState(false);
	const [selectedActifForStock, setSelectedActifForStock] = useState(null);
	const [stockForm, setStockForm] = useState({ quantite: '', observations: '' });
	const [loadingAddStock, setLoadingAddStock] = useState(false);

	const [addProductModalOpen, setAddProductModalOpen] = useState(false);
	const [addProductForm, setAddProductForm] = useState({ productId: '', siteId: '', quantite: '', prixUnitaire: '' });
	const [products, setProducts] = useState([]);
	const [sites, setSites] = useState([]);
	const [loadingAddProduct, setLoadingAddProduct] = useState(false);

	// États pour la recherche du produit
	const [productSearch, setProductSearch] = useState('');
	const [productOpen, setProductOpen] = useState(false);
	const [productHighlighted, setProductHighlighted] = useState(0);

	// États pour la recherche du site
	const [siteSearch, setSiteSearch] = useState('');
	const [siteOpen, setSiteOpen] = useState(false);
	const [siteHighlighted, setSiteHighlighted] = useState(0);

	// Produits filtrés
	const filteredProducts = products.filter(product => (product.productName || '').toLowerCase().includes(productSearch.toLowerCase()) || (product.codeCPC || '').toLowerCase().includes(productSearch.toLowerCase()));

	// Sites filtrés
	const filteredSites = sites.filter(site => (site.siteName || '').toLowerCase().includes(siteSearch.toLowerCase()));

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

	const handleShowDetail = async id => {
		try {
			setLoadingDetail(true);
			const token = user?.token || localStorage.getItem('authToken');
			const data = await getActifById(id, token);
			setDetailActif(data || null);
			setDetailOpen(true);
		} catch (err) {
			console.error('Erreur lors du chargement du détail de l\'actif :', err);
			toast.error('Erreur lors du chargement du détail');
		} finally {
			setLoadingDetail(false);
		}
	};

	const handleOpenStockModal = (actif) => {
		setSelectedActifForStock(actif);
		setStockForm({ quantite: '', observations: '' });
		setStockModalOpen(true);
	};

	const handleAddStock = async () => {
		if (!stockForm.quantite || !selectedActifForStock) {
			toast.error('Veuillez remplir la quantité');
			return;
		}

		const siteOrigineId = selectedActifForStock.depotId || selectedActifForStock.siteOrigineId;
		if (!siteOrigineId) {
			toast.error("Dépôt d'origine introuvable");
			return;
		}

		try {
			setLoadingAddStock(true);
			const params = {
				productId: selectedActifForStock.productId,
				siteOrigineId,
				quantite: stockForm.quantite,
				prixUnitaire: selectedActifForStock.prixUnitaire || 0,
				observations: stockForm.observations,
			};

			await initializeTransaction(params, user?.token || localStorage.getItem('authToken'));
			toast.success('Stock ajouté avec succès');
			setStockModalOpen(false);
			setStockForm({ quantite: '', observations: '' });
			setSelectedActifForStock(null);
			await fetchActifs();
		} catch (error) {
			console.error('Erreur lors de l\'ajout du stock:', error);
			toast.error('Erreur lors de l\'ajout du stock');
		} finally {
			setLoadingAddStock(false);
		}
	};

	const handleOpenAddProductModal = async () => {
		setAddProductModalOpen(true);
		setProductSearch('');
		setProductOpen(false);
		setProductHighlighted(0);
		setSiteSearch('');
		setSiteOpen(false);
		setSiteHighlighted(0);
		try {
			const prodRes = await selectAllProduits();
			setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);

			const sitesRes = await getMySites({ limit: 100, page: 1 });
			setSites(sitesRes.data || []);
		} catch (error) {
			console.error('Erreur lors du chargement des données:', error);
			toast.error('Erreur lors du chargement des données');
		}
	};

	const handleAddProductToSite = async () => {
		if (!addProductForm.productId || !addProductForm.siteId || !addProductForm.quantite) {
			toast.error('Veuillez remplir tous les champs');
			return;
		}

		try {
			setLoadingAddProduct(true);
			const params = {
				productId: addProductForm.productId,
				siteOrigineId: addProductForm.siteId,
				quantite: addProductForm.quantite,
				prixUnitaire: addProductForm.prixUnitaire,
				observations: '',
			};

			await initializeTransaction(params, user?.token || localStorage.getItem('authToken'));
			toast.success('Produit ajouté au site avec succès');
			setAddProductModalOpen(false);
			setAddProductForm({ productId: '', siteId: '', quantite: '', prixUnitaire: '' });
			setProductSearch('');
			setProductOpen(false);
			setProductHighlighted(0);
			setSiteSearch('');
			setSiteOpen(false);
			setSiteHighlighted(0);
			await fetchActifs();
		} catch (error) {
			console.error('Erreur lors de l\'ajout du produit:', error);
			toast.error('Erreur lors de l\'ajout du produit');
		} finally {
			setLoadingAddProduct(false);
		}
	};

	/* ================= RENDER ================= */

	return (
		<div className="px-6 mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<>
					<div className="flex justify-between items-center mb-6">
						<div>
							<h1 className="text-2xl text-neutral-900 mb-2">Mes Actifs</h1>
							<p className="text-sm text-neutral-600">Historique de vos actifs</p>
						</div>

						<div className="flex gap-3 items-center">
							<Button
								onClick={handleOpenAddProductModal}
								className="bg-violet-600 hover:bg-violet-700 text-white"
							>
								Initialisation du stock
							</Button>
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
					</div>

					<Card className="border-neutral-200 bg-white">
						<ActifsTableOrList loading={loading} actifs={actifs} dateFormat={dateFormat} isDesktop={isDesktop} onShowDetail={handleShowDetail} onOpenStockModal={handleOpenStockModal} />
					</Card>

					<PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />

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
										<b>Code produit :</b> {detailActif.productId?.codeCPC || detailActif.productCode || '-'}
									</div>
									<div>
										<b>Produit :</b> {detailActif.productId?.productName || detailActif.productName || '-'}
									</div>
									<div>
										<b>Dépôt :</b> {detailActif.depotId?.siteName || detailActif.depot || '-'}
									</div>
									<div>
										<b>Adresse dépôt :</b> {detailActif.depotId?.siteAddress || detailActif.depotAdresse || '-'}
									</div>
									<div>
										<b>Quantité :</b> {formatThousands(detailActif.quantite ?? 0)}
									</div>
									{/* <div>
										<b>Prix unitaire :</b> {formatThousands(detailActif.prixUnitaire ?? 0)} Ar
									</div> */}
									{/* <div>
										<b>Valeur totale :</b> {formatThousands(((detailActif.quantite || 0) * (detailActif.prixUnitaire || 0)) ?? 0)} Ar
									</div> */}
									<div>
										<b>Détenteur :</b> {renderPerson(detailActif.detentaire)}
									</div>
									<div>
										<b>Ayant droit :</b> {renderPerson(detailActif.ayant_droit || detailActif.ayantDroit)}
									</div>
								</div>
							)}
						</DialogContent>
					</Dialog>

					{/* MODAL AJOUT STOCK */}
					<Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Ajouter du stock</DialogTitle>
								<DialogDescription>
									{selectedActifForStock?.productName}
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1">Produit</label>
									<Input
										disabled
										value={selectedActifForStock?.productName || ''}
										className="border-neutral-300 bg-neutral-50"
									/>
								</div>

								<div>								<label className="block text-sm font-medium text-neutral-700 mb-1">Site d'origine</label>
									<Input
										disabled
										value={selectedActifForStock?.siteOrigineId || selectedActifForStock?.depot || ''}
										className="border-neutral-300 bg-neutral-50"
									/>
								</div>

								{/* <div>
									<label className="block text-sm font-medium text-neutral-700 mb-1">Prix unitaire (Ar)</label>
									<Input
										disabled
										value={selectedActifForStock?.prixUnitaire || '0'}
										className="border-neutral-300 bg-neutral-50"
									/>
								</div> */}

								<div>									<label className="block text-sm font-medium text-neutral-700 mb-1">Quantité</label>
									<Input
										type="number"
										min="1"
										placeholder="0"
										value={stockForm.quantite}
										onChange={(e) => setStockForm({ ...stockForm, quantite: e.target.value })}
										className="border-neutral-300"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-neutral-700 mb-1">Observations</label>
									<Input
										placeholder="Observations facultatives"
										value={stockForm.observations}
										onChange={(e) => setStockForm({ ...stockForm, observations: e.target.value })}
										className="border-neutral-300"
									/>
								</div>

								<div className="flex justify-end gap-2 pt-4">
									<Button
										variant="outline"
										status="inactive"
										onClick={() => setStockModalOpen(false)}
									>
										Annuler
									</Button>
									<Button
										status={loadingAddStock ? "loading" : "active"}
										onClick={handleAddStock}
										disabled={loadingAddStock}
										className="bg-violet-600 hover:bg-violet-700 text-white"
									>
										{loadingAddStock ? 'Ajout en cours...' : 'Ajouter'}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

					{/* MODAL INITIALISER PRODUIT À UN SITE */}
					<Dialog open={addProductModalOpen} onOpenChange={setAddProductModalOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Initialiser un produit à un site</DialogTitle>
								<DialogDescription>
									Sélectionnez un produit et un site pour l'initialiser
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4">
								<div className="space-y-2">
									<Label>Produit</Label>
									<div className="relative">
										<Input
											placeholder={products.length === 0 ? "Aucun produit disponible" : "Rechercher un produit..."}
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
															setAddProductForm(prev => ({
																...prev,
																productId: product._id,
																// prixUnitaire: product.prixUnitaire || 0
															}));
															setProductSearch(product.productName);
															setProductOpen(false);
														}
													}
												}
											}}
											className="w-full"
											disabled={products.length === 0}
										/>
										{productOpen && filteredProducts.length > 0 && (
											<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
												{filteredProducts.map((product, idx) => (
													<button
														type="button"
														key={product._id}
														onMouseEnter={() => setProductHighlighted(idx)}
														onClick={() => {
															setAddProductForm(prev => ({
																...prev,
																productId: product._id,
																// prixUnitaire: product.prixUnitaire || 0
															}));
															setProductSearch(product.productName);
															setProductOpen(false);
														}}
														className={`w-full text-left px-3 py-2 text-sm ${idx === productHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
													>
														{product.productName} - {product.codeCPC}
													</button>
												))}
											</div>
										)}
										{productOpen && filteredProducts.length === 0 && products.length > 0 && (
											<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
												<div className="px-3 py-2 text-sm text-neutral-500">Aucun produit trouvé</div>
											</div>
										)}
									</div>
								</div>

								<div className="space-y-2">
									<Label>Site</Label>
									<div className="relative">
										<Input
											placeholder={sites.length === 0 ? "Aucun site disponible" : "Rechercher un site..."}
											value={siteSearch}
											onChange={e => { setSiteSearch(e.target.value); setSiteHighlighted(0); }}
											onFocus={() => { setSiteOpen(true); setSiteHighlighted(0); }}
											onBlur={() => setTimeout(() => setSiteOpen(false), 150)}
											onKeyDown={(e) => {
												if (e.key === 'Escape') return setSiteOpen(false);
												if (!siteOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
													setSiteOpen(true);
													e.preventDefault();
													return;
												}
												if (siteOpen) {
													if (e.key === 'ArrowDown') {
														e.preventDefault();
														setSiteHighlighted(i => Math.min(i + 1, Math.max(filteredSites.length - 1, 0)));
													} else if (e.key === 'ArrowUp') {
														e.preventDefault();
														setSiteHighlighted(i => Math.max(i - 1, 0));
													} else if (e.key === 'Enter') {
														e.preventDefault();
														const site = filteredSites[siteHighlighted];
														if (site) {
															setAddProductForm(prev => ({
																...prev,
																siteId: site._id
															}));
															setSiteSearch(site.siteName);
															setSiteOpen(false);
														}
													}
												}
											}}
											className="w-full"
											disabled={sites.length === 0}
										/>
										{siteOpen && filteredSites.length > 0 && (
											<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
												{filteredSites.map((site, idx) => (
													<button
														type="button"
														key={site._id}
														onMouseEnter={() => setSiteHighlighted(idx)}
														onClick={() => {
															setAddProductForm(prev => ({
																...prev,
																siteId: site._id
															}));
															setSiteSearch(site.siteName);
															setSiteOpen(false);
														}}
														className={`w-full text-left px-3 py-2 text-sm ${idx === siteHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
													>
														{site.siteName}
													</button>
												))}
											</div>
										)}
										{siteOpen && filteredSites.length === 0 && sites.length > 0 && (
											<div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
												<div className="px-3 py-2 text-sm text-neutral-500">Aucun site trouvé</div>
											</div>
										)}
									</div>
								</div>

								<div>
									<Label className="block text-sm font-medium text-neutral-700 mb-1">Quantité</Label>
									<Input
										type="number"
										min="1"
										placeholder="0"
										value={addProductForm.quantite}
										onChange={(e) => setAddProductForm({ ...addProductForm, quantite: e.target.value })}
										className="border-neutral-300"
									/>
								</div>

								{/* <div>
									<Label className="block text-sm font-medium text-neutral-700 mb-1">Prix unitaire (Ar)</Label>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={addProductForm.prixUnitaire}
										onChange={(e) => setAddProductForm({ ...addProductForm, prixUnitaire: e.target.value })}
										className="border-neutral-300"
									/>
								</div> */}

								<div className="flex justify-end gap-2 pt-4">
									<Button
										variant="outline"
										status="inactive"
										onClick={() => setAddProductModalOpen(false)}
									>
										Annuler
									</Button>
									<Button
										status={loadingAddProduct ? "loading" : "active"}
										onClick={handleAddProductToSite}
										disabled={loadingAddProduct}
										className="bg-violet-600 hover:bg-violet-700 text-white"
									>
										{loadingAddProduct ? 'Ajout en cours...' : 'Ajouter'}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</>
			)}
		</div>
	);
};

export default Actifs;

function ActifsTableOrList({ loading, actifs, dateFormat, isDesktop, onShowDetail, onOpenStockModal }) {
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
							{/* <TableHead className="text-xs text-neutral-600 text-right">PU (Ar)</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Total (Ar)</TableHead> */}
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
								{/* <TableCell className="text-sm text-right">{formatThousands(item.prixUnitaire)}</TableCell>
								<TableCell className="text-sm text-right">{formatThousands(item.valeurTotale)}</TableCell> */}
								<TableCell className="text-sm">{renderPerson(item.detentaire)}</TableCell>
								<TableCell className="text-sm">{renderPerson(item.ayant_droit || item.ayantDroit)}</TableCell>
								<TableCell className="text-sm">{item.dateCreation ? dateFormat(item.dateCreation) : '-'}</TableCell>
								<TableCell className="text-sm text-right">
									<div className="flex gap-2 justify-end">
										<Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id)}>
											<InfoIcon className="w-5 h-5 text-violet-600" />
										</Button>
										<Button variant="ghost" size="sm" onClick={() => onOpenStockModal(item)}>
											<AddHomeIcon className="w-4 h-4 text-orange-500" /> Rajouter du stock
										</Button>
									</div>
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
								<Button variant="ghost" size="sm" onClick={() => onOpenStockModal(item)}><AddHomeIcon className="w-4 h-4 text-orange-500" /> Rajouter du stock</Button>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}