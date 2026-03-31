
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getMyStocksPassifs, withdrawStock } from '../../services/stocks_move.service.js';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useScreenType from '../../utils/useScreenType';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import { getAllUsersSelect } from '../../services/user.service';
import { getAllSitesSelect } from '../../services/site.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { toast } from 'sonner';
import InfoIcon from '@mui/icons-material/Info';

const Passifs = () => {
	const dateFormat = useDateFormat();
	const { isDesktop } = useScreenType();
	usePageTitle('Passifs');
	const [passifs, setPassifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [total, setTotal] = useState(0);

	// Pour le détail d'un passif
	const [detailOpen, setDetailOpen] = useState(false);
	const [detailPassif, setDetailPassif] = useState(null);
	const [usersOptions, setUsersOptions] = useState([]);
	const [loadingDetail, setLoadingDetail] = useState(false);
	const [allSites, setAllSites] = useState([]);
	const { user } = useAuth();

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

	const handleSelectPassifForWithdrawal = passifId => {
		const item = passifs.find(p => p._id === passifId);

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

		try {
			const token = localStorage.getItem('token');
			const payload = {
				siteOrigineId: withdrawalForm.siteOrigineId,
				siteDestinationId: withdrawalForm.siteDestinationId,
				productId: withdrawalForm.actifId || withdrawalForm.productId,
				quantite: Number(withdrawalForm.quantite),
				prixUnitaire: withdrawalForm.prixUnitaire !== '' ? Number(withdrawalForm.prixUnitaire) : null,
				detentaireId: withdrawalForm.detentaire || withdrawalForm.detentaireId,
				ayant_droit: withdrawalForm.ayant_droit,
				observations: withdrawalForm.observations || '',
			};

			await withdrawStock(payload, token);
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
			setMaxWithdrawalQty(undefined);
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
			const data = passifs.find(item => item._id === passifId) || null;
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
					<Tabs defaultValue="form" className="space-y-6">
						<TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-xl">
							<TabsTrigger value="form" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Formulaire de retrait</TabsTrigger>
							<TabsTrigger value="list" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Mes passifs</TabsTrigger>
						</TabsList>

						<TabsContent value="form">
							<Card className="border-neutral-200 bg-white">
								<div className="px-4 pt-4">
									<h2 className="text-lg font-semibold text-neutral-900">Formulaire de retrait</h2>
									<p className="text-sm text-neutral-600">Renseignez les informations pour retirer un passif.</p>
								</div>
								<form className="space-y-4 p-4" onSubmit={handleWithdrawalSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="actifId">Passif à retirer</Label>
											<Select value={withdrawalForm.actifId} onValueChange={handleSelectPassifForWithdrawal}>
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner un passif" />
												</SelectTrigger>
												<SelectContent>
													{passifs.map(item => (
														<SelectItem key={item._id} value={item._id}>
															{item.productId?.productName || item.productId?.codeCPC || '-'} - Qté: {formatThousands(item.quantite || 0)}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
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
														usersOptions.map(userOption => (
															<SelectItem key={userOption._id} value={userOption._id}>{userOption.name || userOption.userNickName || userOption.userName || userOption.userFirstname || userOption.userId}</SelectItem>
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
														usersOptions.map(userOption => (
															<SelectItem key={userOption._id} value={userOption._id}>{userOption.name || userOption.userNickName || userOption.userName || userOption.userFirstname || userOption.userId}</SelectItem>
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
											setMaxWithdrawalQty(undefined);
										}}>
											Annuler
										</Button>
										<Button variant="default" className="bg-violet-600 text-white hover:bg-violet-700" type="submit">Valider le retrait</Button>
									</div>
								</form>
							</Card>
						</TabsContent>

						<TabsContent value="list" className="space-y-4">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
								<h1 className="text-2xl text-neutral-900">Mes Passifs</h1>
								<Input
									placeholder="Rechercher..."
									value={search}
									onChange={e => { setPage(1); setSearch(e.target.value); }}
									className="max-w-xs border-black bg-white"
								/>
							</div>
							<Card className="border-neutral-200 bg-white">
								<PassifsTableOrList loading={loading} passifs={passifs} dateFormat={dateFormat} isDesktop={isDesktop} onShowDetail={handleShowDetail} />
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
						</TabsContent>
					</Tabs>
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
				</>
			)}
		</div>
	);
};
export default Passifs;

function PassifsTableOrList({ loading, passifs, dateFormat, isDesktop, onShowDetail }) {
	if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
	if (!passifs || passifs.length === 0) return <div className="p-8 text-center text-neutral-400">Aucun passif trouvé</div>;

	if (isDesktop) {
		return (
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="text-xs text-neutral-600">Produit</TableHead>
							<TableHead className="text-xs text-neutral-600">Type</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Quantité</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Prix unitaire</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right">Montant</TableHead>
							<TableHead className="text-xs text-neutral-600">Départ</TableHead>
							<TableHead className="text-xs text-neutral-600">Arrivée</TableHead>
							<TableHead className="text-xs text-neutral-600">Détenteur</TableHead>
							<TableHead className="text-xs text-neutral-600">Ayant droit</TableHead>
							<TableHead className="text-xs text-neutral-600">Date</TableHead>
							<TableHead className="text-xs text-neutral-600 text-right p-4">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{passifs.map((item, idx) => {
							const produit = item.productId?.productName || item.productId?.codeCPC || '-';
							const quantite = item.quantite ?? '-';
							const prixUnitaire = item.prixUnitaire ?? null;
							const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
							const depart = item.siteOrigineId?.siteName || item.siteOrigineId || '-';
							const arrivee = item.siteDestinationId?.siteName || item.siteDestinationId || '-';
							const detenteur = item.detentaire?.userNickName || item.operatorId?.userNickName || '-';
							const ayantDroit = item.ayant_droit?.userNickName || '-';
							const date = item.createdAt;
							return (
								<TableRow key={idx}>
									<TableCell className="text-sm">{produit}</TableCell>
									<TableCell className="text-sm">{item.type || '-'}</TableCell>
									<TableCell className="text-sm text-right">{quantite}</TableCell>
									<TableCell className="text-sm text-right">{prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</TableCell>
									<TableCell className="text-sm text-right">{montant !== null ? formatThousands(montant) : '-'}</TableCell>
									<TableCell className="text-sm">{depart}</TableCell>
									<TableCell className="text-sm">{arrivee}</TableCell>
									<TableCell className="text-sm">{detenteur}</TableCell>
									<TableCell className="text-sm">{ayantDroit}</TableCell>
									<TableCell className="text-sm">{date ? dateFormat(date) : '-'}</TableCell>
									<TableCell className="text-sm text-right">
										<Button variant="ghost" size="sm" onClick={() => onShowDetail(item._id)}>
											<InfoIcon className="w-5 h-5 text-violet-600" />
										</Button>
									</TableCell>
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
			{passifs.map((item, idx) => {
				const produit = item.productId?.productName || item.productId?.codeCPC || '-';
				const quantite = item.quantite ?? '-';
				const prixUnitaire = item.prixUnitaire ?? null;
				const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
				const depart = item.siteOrigineId?.siteName || item.siteOrigineId || '-';
				const arrivee = item.siteDestinationId?.siteName || item.siteDestinationId || '-';
				const detenteur = item.detentaire?.userNickName || item.operatorId?.userNickName || '-';
				const ayantDroit = item.ayant_droit?.userNickName || '-';
				const date = item.createdAt;

				return (
					<Card key={idx} className="p-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<div className="font-medium text-neutral-900 truncate">{produit}</div>
								<div className="text-xs text-neutral-500">{depart} → {arrivee}</div>
								<div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-600">
									<div>Quantité: {quantite !== undefined && quantite !== null ? formatThousands(quantite) : '-'}</div>
									<div>Prix: {prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</div>
									<div>Montant: {montant !== null ? formatThousands(montant) : '-'}</div>
									<div>Détenteur: {detenteur}</div>
									<div>Ayant droit: {ayantDroit}</div>
									<div>{date ? dateFormat(date) : '-'}</div>
								</div>
							</div>
							<div className="flex flex-col items-end gap-2">
								<Badge variant={item.type === 'RETRAIT' ? 'destructive' : item.type === 'DEPOT' ? 'secondary' : 'default'}>{item.type || '-'}</Badge>
								<Button variant="ghost" size="sm" onClick={() => onShowDetail(item._id)}>
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
