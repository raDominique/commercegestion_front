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
import { getWithdrawals, withdrawStock } from '../../services/stocks_move.service';
import { getFullMediaUrl } from '../../services/media.service';
import { getPassifs } from '../../services/ledger.service.js';
import { getAllUsersSelect } from '../../services/user.service';
import { getAllSitesSelect } from '../../services/site.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { getProfile } from '../../services/auth.service.js';
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
	const [allSites, setAllSites] = useState([]);
	const [passifsList, setPassifsList] = useState([]);
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

	// Récupérer les passifs pour le formulaire
	const fetchPassifsForForm = async () => {
		try {
			let userId = user?._id;
			if (!userId) {
				try {
					const profile = await getProfile();
					userId = profile?._id || profile?.id;
				} catch (e) {
					// Silently fail
				}
			}
			if (userId) {
				const res = await getPassifs(userId, { limit: 100, page: 1 });
				setPassifsList(Array.isArray(res.data) ? res.data : []);
			}
		} catch (err) {
			setPassifsList([]);
		}
	};

	useEffect(() => {
		fetchPassifs();
	}, [page, limit]);

	useEffect(() => {
		fetchPassifsForForm();
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
			toast.success('Retrait effectué avec succès');
			fetchPassifs();
			fetchPassifsForForm();
		} catch {
			toast.error('Erreur lors du retrait du stock');
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

								{/* PAGINATION */}
								<div className="flex justify-end items-center gap-4 mt-4">
									<div className="flex items-center gap-2">
										<label htmlFor="retrait-limit" className="text-sm text-neutral-600">Par page</label>
										<Select value={String(limit)} onValueChange={(value) => { setLimit(Number(value)); setPage(1); }}>
											<SelectTrigger className="bg-white">
												<SelectValue placeholder="Par page" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value={String(10)}>10 / page</SelectItem>
												<SelectItem value={String(20)}>20 / page</SelectItem>
												<SelectItem value={String(50)}>50 / page</SelectItem>
												<SelectItem value={String(100)}>100 / page</SelectItem>
											</SelectContent>
										</Select>
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
							</div>
						</TabsContent>

						<TabsContent value="form">
							<Card className="border-neutral-200 bg-white">
								<div className="px-4 pt-4">
									<h2 className="text-lg font-semibold text-neutral-900">Formulaire de retrait</h2>
									<p className="text-sm text-neutral-600">Renseignez les informations pour retirer un passif.</p>
								</div>
								<form className="space-y-4 p-4" onSubmit={handleWithdrawalSubmit}>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="actifId">Actif à retirer</Label>
											<Select value={withdrawalForm.actifId} onValueChange={handleSelectPassifForWithdrawal}>
												<SelectTrigger>
													<SelectValue placeholder="Sélectionner un actif" />
												</SelectTrigger>
												<SelectContent>
													{passifsList.map(item => (
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
									<TableCell className="text-sm">{produit}</TableCell>
									<TableCell>
										{item.productId?.productImage ? (
											<img src={getFullMediaUrl(item.productId.productImage)} alt={item.productId.productName} className="w-12 h-12 object-cover rounded" />
										) : (
											<span className="text-neutral-400">-</span>
										)}
									</TableCell>
									<TableCell className="text-sm">{operatorName}</TableCell>
									<TableCell className="text-sm">{detenteur}</TableCell>
									<TableCell className="text-sm">{ayantDroit}</TableCell>
									<TableCell className="text-sm">{depart}</TableCell>
									<TableCell className="text-sm">{arrivee}</TableCell>
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