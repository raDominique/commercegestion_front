
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../components/ui/tooltip';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import ExportButton from '../../components/commons/ExportButton.jsx';
import { exportAndDownloadPassifs } from '../../services/export.service.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';
import { getMovementTypeBadgeProps, getTransactionStatusBadgeProps } from '../../constants/transaction.enums';
import { getFullMediaUrl } from '../../services/media.service';
import InfoIcon from '@mui/icons-material/Info';
import { Loader } from '../../components/ui/loader';

// Largeur forcée de la colonne Actions — même pattern que Actifs.jsx
const ACTION_COL_STYLE_LG = { minWidth: '200px', width: '200px' };

const renderPerson = (person) => {
	if (!person) return '-';
	if (typeof person === 'string') return person;
	if (person.userNickName) return person.userNickName;
	if (person.userName) return person.userName;
	if (person.name) return person.name;
	return '-';
};

// Pour "type": "PASSIF" dont "statut": "APPROVED", on affiche quantiteDisponible
const getQuantiteAffichee = (item) => {
	if (item?.type === 'PASSIF' && item?.statut === 'APPROVED' && item?.quantiteDisponible != null) {
		return item.quantiteDisponible;
	}
	return item?.quantite;
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
			const params = { page, limit, search, group: true };
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
		<div className="px-4 md:px-6 mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<div className="space-y-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl text-neutral-900 mb-2">Mes Passifs</h1>
							<p className="text-sm text-neutral-600">Historique de vos passifs</p>
						</div>
						<div className="flex flex-wrap gap-3 items-center">
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
								className="w-full md:max-w-xs border-black bg-white"
							/>
						</div>
					</div>
					<Card className="border-neutral-200 bg-white">
						<PassifsTableOrList loading={loading} passifs={passifs} dateFormat={dateFormat} isDesktop={isDesktop} onShowDetail={handleShowDetail} />
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
					{/* Modal de détail du passif avec Dialog */}
					<Dialog open={detailOpen} onOpenChange={setDetailOpen}>
						<DialogContent aria-describedby="detail-passif-desc">
							<DialogHeader>
								<DialogTitle>Détail du Passif</DialogTitle>
								<DialogDescription id="detail-passif-desc">
									Informations détaillées sur le passif sélectionné.
								</DialogDescription>
							</DialogHeader>
							{loadingDetail ? (
								<div className="flex justify-center py-8"><Loader message="Chargement..." /></div>
							) : detailPassif ? (
								<div className="space-y-4 text-sm wrap-break-word">
									<div className="flex flex-col items-start gap-4 sm:flex-row">
										<div className="w-20 h-20 bg-neutral-100 rounded overflow-hidden shrink-0 flex items-center justify-center">
											{detailPassif.productId?.productImage ? (
												<img src={getFullMediaUrl(detailPassif.productId.productImage)} alt={detailPassif.productId.productName || 'product'} className="w-full h-full object-cover" />
											) : (
												<span className="text-neutral-400">-</span>
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div><b>Produit :</b> {detailPassif.productId?.productName || '-'}</div>
											<div><b>Code CPC :</b> {detailPassif.productId?.codeCPC || '-'}</div>
											<div><b>Dépôt :</b> {detailPassif.depotId?.siteName || '-'}</div>
											<div><b>Adresse dépôt :</b> {detailPassif.depotId?.siteAddress || '-'}</div>
										</div>
										<div className="flex flex-wrap gap-1 shrink-0">
											{(() => {
												const typeBadge = getMovementTypeBadgeProps(detailPassif.typePassif || detailPassif.type);
												const statusBadge = getTransactionStatusBadgeProps(detailPassif.statut || detailPassif.status);
												return (
													<>
														<Badge className={`text-xs ${typeBadge.className} px-2 py-0.5 rounded`}>{typeBadge.label}</Badge>
														<Badge className={`text-xs ${statusBadge.className} px-2 py-0.5 rounded`}>{statusBadge.label}</Badge>
													</>
												);
											})()}
										</div>
									</div>
									<div className="flex flex-col gap-y-1 text-xs text-neutral-700 wrap-break-word sm:grid sm:grid-cols-2 sm:gap-x-4">
										<span className="block min-w-0"><b className="whitespace-nowrap">Quantité :</b> {detailPassif.quantite != null ? formatThousands(detailPassif.quantite) : '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Prix unitaire :</b> {detailPassif.prixUnitaire != null ? formatThousands(detailPassif.prixUnitaire) : '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Créancier :</b> {renderPerson(detailPassif.creancierId)}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Détenteur :</b> {renderPerson(detailPassif.detentaire)}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Ayant droit :</b> {renderPerson(detailPassif.ayant_droit)}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Utilisateur :</b> {detailPassif.userId?.userNickName || detailPassif.userId?.userName || '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Email :</b> {detailPassif.userId?.userEmail || '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Téléphone :</b> {detailPassif.userId?.userPhone || '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Statut :</b> {detailPassif.isActive ? 'Actif' : 'Inactif'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Type :</b> {detailPassif.typePassif || detailPassif.type || '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Créé le :</b> {detailPassif.createdAt ? dateFormat(detailPassif.createdAt) : '-'}</span>
										<span className="block min-w-0"><b className="whitespace-nowrap">Mis à jour le :</b> {detailPassif.updatedAt ? dateFormat(detailPassif.updatedAt) : '-'}</span>
									</div>
								</div>
							) : (
								<div className="p-8 text-center text-neutral-400">Aucune donnée</div>
							)}
						</DialogContent>
					</Dialog>
				</div>
			)}
		</div>
	);
};
export default Passifs;

function PassifsTableOrList({ loading, passifs, dateFormat, isDesktop, onShowDetail }) {
	if (loading) return <div className="p-8 flex justify-center"><Loader message="Chargement..." /></div>;
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
							<TableHead className="text-xs text-neutral-600 text-center">Quantité</TableHead>
							<TableHead className="text-xs text-neutral-600">Ayant droit</TableHead>
							<TableHead className="text-xs text-neutral-600">Type</TableHead>
							<TableHead className="text-xs text-neutral-600">Statut</TableHead>
							<TableHead className="text-xs text-neutral-600">Date</TableHead>
							<TableHead
								className="text-xs text-neutral-600 text-right p-2 whitespace-nowrap"
								style={ACTION_COL_STYLE_LG}
							>
								Actions
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{passifs.map((item, idx) => {
							const typeBadge = getMovementTypeBadgeProps(item.type);
							const statusBadge = getTransactionStatusBadgeProps(item.statut);
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
									<TableCell className="text-sm truncate max-w-35" title={item.depot || '-'}>{item.depot || '-'}</TableCell>
									<TableCell className="text-sm truncate max-w-35" title={item.depotAdresse || '-'}>{item.depotAdresse || '-'}</TableCell>
									<TableCell className="text-sm text-center font-medium">{formatThousands(getQuantiteAffichee(item))}</TableCell>
									<TableCell className="text-sm truncate max-w-xs">{renderPerson(item.ayant_droit || item.ayantDroit)}</TableCell>
									<TableCell className="text-sm">
										<Badge className={`text-xs ${typeBadge.className} px-2 py-0.5 rounded`}>
											{typeBadge.label}
										</Badge>
									</TableCell>
									<TableCell className="text-sm">
										<Badge className={`text-xs ${statusBadge.className} px-2 py-0.5 rounded`}>
											{statusBadge.label}
										</Badge>
									</TableCell>
									<TableCell className="text-sm">{item.dateCreation ? dateFormat(item.dateCreation) : '-'}</TableCell>
									<TableCell className="text-sm text-right whitespace-nowrap" style={ACTION_COL_STYLE_LG}>
										<div className="flex items-center justify-end gap-1">
											<Tooltip>
												<TooltipTrigger asChild>
													<Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id || item._id)}>
														<InfoIcon className="w-4 h-4 text-violet-600" />
													</Button>
												</TooltipTrigger>
												<TooltipContent>Détails</TooltipContent>
											</Tooltip>
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
		<div className="space-y-4 p-4">
			{passifs.map((item, idx) => {
				const typeBadge = getMovementTypeBadgeProps(item.type);
				const statusBadge = getTransactionStatusBadgeProps(item.statut);
				const produit = item.productName || (item.productId && (item.productId.productName || item.productId)) || '-';
				const code = item.productCode || item.productId?.codeCPC || '-';
				const quantite = getQuantiteAffichee(item);
				const ayantDroit = renderPerson(item.ayant_droit || item.ayantDroit);
				const date = item.dateCreation || item.createdAt || item.approvedAt;

				return (
					<Card key={item._id || item.id || idx} className="p-4">
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
							<div className="flex items-center gap-4 min-w-0">
								<div className="w-12 h-12 flex items-center justify-center bg-neutral-100 rounded overflow-hidden shrink-0">
									{item.productImage ? (
										<img src={getFullMediaUrl(item.productImage)} alt={produit} className="w-full h-full object-cover" />
									) : (
										<span className="text-neutral-400">-</span>
									)}
								</div>
								<div className="min-w-0">
									<div className="font-medium text-neutral-900 truncate">{produit}</div>
									<div className="text-xs text-neutral-500">{code}</div>
									<div className="text-xs text-neutral-500 mt-1">{item.depot || '-'}</div>
								</div>
							</div>
							<div className="flex flex-col sm:items-end gap-2">
								<div className="text-xs text-neutral-700 text-right">
									<div className="font-semibold">Quantité</div>
									<div>{quantite !== undefined && quantite !== null ? formatThousands(quantite) : '-'}</div>
								</div>
								<div className="flex flex-wrap gap-1 sm:justify-end">
									<Badge className={`text-xs ${typeBadge.className} px-2 py-0.5 rounded`}>{typeBadge.label}</Badge>
									<Badge className={`text-xs ${statusBadge.className} px-2 py-0.5 rounded`}>{statusBadge.label}</Badge>
								</div>
								<div className="text-xs text-neutral-600">Ayant droit: {ayantDroit}</div>
								<div className="text-xs text-neutral-500">{date ? dateFormat(date) : '-'}</div>
								<div className="flex items-center gap-2 mt-2">
									<Tooltip>
										<TooltipTrigger asChild>
											<Button variant="ghost" size="sm" onClick={() => onShowDetail(item._id || item.id)}>
												<InfoIcon className="w-4 h-4 text-violet-600" />
											</Button>
										</TooltipTrigger>
										<TooltipContent>Détails</TooltipContent>
									</Tooltip>
								</div>
							</div>
						</div>
					</Card>
				);
			})}
		</div>
	);
}
