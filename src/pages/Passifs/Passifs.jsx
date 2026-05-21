
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getPassifs } from '../../services/ledger.service.js';
import { getPassifById } from '../../services/passifs.service';
import { toast } from 'sonner';
import { getProfile } from '../../services/auth.service.js';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useScreenType from '../../utils/useScreenType';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import ExportButton from '../../components/commons/ExportButton.jsx';
import { exportAndDownloadPassifs } from '../../services/export.service.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';
import { getFullMediaUrl } from '../../services/media.service';
import InfoIcon from '@mui/icons-material/Info';
const renderPerson = (person) => {
	if (!person) return '-';
	if (typeof person === 'string') return person;
	if (person.userNickName) return person.userNickName;
	if (person.userName) return person.userName;
	if (person.name) return person.name;
	return '-';
};


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
	const [loadingDetail, setLoadingDetail] = useState(false);
	const { user } = useAuth();

	const fetchPassifs = async () => {
		setLoading(true);
		try {
			let userId = user?._id;
			if (!userId) {
				try {
					const profile = await getProfile();
					userId = profile?._id || profile?.id;
				} catch (e) {
					throw new Error("Impossible de récupérer l'identifiant utilisateur");
				}
			}
			const params = { limit, page };
			const res = await getPassifs(userId, params);
			const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
			setPassifs(items);
			const totalCount = Number(res?.total ?? res?.pagination?.total ?? items.length);
			setTotal(Number.isFinite(totalCount) ? totalCount : 0);
		} catch (err) {
			setPassifs([]);
			setTotal(0);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPassifs();
	}, [search, page, limit]);

	// Fonction pour afficher le détail d'un passif
	const handleShowDetail = async (passifId) => {
		setLoadingDetail(true);
		try {
			const token = user?.token || localStorage.getItem('authToken');
			const data = await getPassifById(passifId, token);
			setDetailPassif(data || null);
			setDetailOpen(true);
		} catch (err) {
			setDetailPassif(null);
			console.error('Erreur lors de la récupération du détail du passif :', err);
			toast.error('Erreur lors du chargement du détail');
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
						<div>
							<h1 className="text-2xl text-neutral-900 mb-2">Mes Passifs</h1>
							<p className="text-sm text-neutral-600">Historique de vos passifs</p>
						</div>
						<div className="flex gap-3 items-center">
							<ExportButton
								exportFunction={exportAndDownloadPassifs}
								formats={[
									{ label: 'PDF', value: 'pdf', description: 'Document PDF' },
									{ label: 'Excel', value: 'excel', description: 'Fichier Excel' }
								]}
								title="Exporter les passifs"
								buttonLabel="Exporter"
							/>
							<Input
								placeholder="Rechercher..."
								value={search}
								onChange={e => { setPage(1); setSearch(e.target.value); }}
								className="max-w-xs border-black bg-white"
							/>
						</div>
					</div>
					<Card className="border-neutral-200 bg-white">
						<PassifsTableOrList loading={loading} passifs={passifs} dateFormat={dateFormat} isDesktop={isDesktop} onShowDetail={handleShowDetail} />
					</Card>
					<PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />
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
						{passifs.map((item, idx) => {
							return (
								<TableRow key={item.id || item._id || idx}>
									<TableCell className="text-sm truncate max-w-xs">{item.productName || '-'}</TableCell>
									<TableCell className="text-sm text-neutral-500 truncate max-w-xs">{item.productCode || '-'}</TableCell>
									<TableCell>
										{item.productImage ? (
											<img src={getFullMediaUrl(item.productImage)} alt={item.productName || 'product'} className="w-12 h-12 rounded object-cover" />
										) : (
											<span className="text-neutral-400">-</span>
										)}
									</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{item.depot || '-'}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{item.depotAdresse || '-'}</TableCell>
									<TableCell className="text-sm text-right">{formatThousands(item.quantite)}</TableCell>
									{/* <TableCell className="text-sm text-right">{formatThousands(item.prixUnitaire)}</TableCell>
									<TableCell className="text-sm text-right">{formatThousands(item.valeurTotale)}</TableCell> */}
									<TableCell className="text-sm truncate max-w-xs">{renderPerson(item.detentaire)}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{renderPerson(item.ayant_droit || item.ayantDroit)}</TableCell>
									<TableCell className="text-sm">{item.dateCreation ? dateFormat(item.dateCreation) : '-'}</TableCell>
									<TableCell className="text-sm text-right">
										<div className="flex gap-2 justify-end">
											<Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id || item._id)}>
												<InfoIcon className="w-5 h-5 text-violet-600" />
											</Button>
										</div>
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
				const produit = item.productName || (item.productId && (item.productId.productName || item.productId)) || '-';
				const quantite = item.quantite ?? '-';
				const prixUnitaire = item.prixUnitaire ?? null;
				const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
				const depart = item.depot || item.siteOrigineId?.siteName || '-';
				const arrivee = item.depotAdresse || item.siteDestinationId?.siteName || '-';
				const detenteur = item.detentaire || item.detentaire?.userNickName || item.operatorId?.userNickName || '-';
				const ayantDroit = item.ayantDroit || item.ayant_droit || item.ayant_droit?.userNickName || '-';
				const date = item.dateCreation || item.createdAt || item.approvedAt;

				return (
					<Card key={item._id || item.id || idx} className="p-4">
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
								{item.isActive ? (
									<Badge className={`text-xs bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 rounded`}>Actif</Badge>
								) : (
									<Badge className={`text-xs bg-neutral-100 text-neutral-700 border-neutral-200 px-2 py-0.5 rounded`}>Inactif</Badge>
								)}
								<Button variant="ghost" size="sm" onClick={() => onShowDetail(item._id || item.id)}>
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
