
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getPassifs } from '../../services/ledger.service.js';
import { getProfile } from '../../services/auth.service.js';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useScreenType from '../../utils/useScreenType';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';
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
	const [loadingDetail, setLoadingDetail] = useState(false);
	const { user } = useAuth();

	const fetchPassifs = async () => {
		setLoading(true);
		try {
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
			const params = { limit, page };
			const res = await getPassifs(userId, params);
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
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<div>
							<h1 className="text-2xl text-neutral-900 mb-2">Mes Passifs</h1>
							<p className="text-sm text-neutral-600">Historique de vos passifs</p>
						</div>
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
