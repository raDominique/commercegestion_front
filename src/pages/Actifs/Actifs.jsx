import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { getActifs } from '../../services/ledger.service';
import { getProfile } from '../../services/auth.service';
import { initializeTransaction } from '../../services/transaction.service';
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
import usePageTitle from '../../utils/usePageTitle.jsx';
import useScreenType from '../../utils/useScreenType';
import { getFullMediaUrl } from '../../services/media.service';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

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
			const actif = actifs.find(a => a.id === id);
			setDetailActif(actif);
			setDetailOpen(true);
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
			alert('Veuillez remplir la quantité');
			return;
		}

		try {
			setLoadingAddStock(true);
			const params = {
				productId: selectedActifForStock.id,
				siteOrigineId: selectedActifForStock.siteOrigineId || selectedActifForStock.depot,
				quantite: stockForm.quantite,
				prixUnitaire: selectedActifForStock.prixUnitaire || 0,
				observations: stockForm.observations,
			};

			await initializeTransaction(params, user?.token || localStorage.getItem('authToken'));
			alert('Stock ajouté avec succès');
			setStockModalOpen(false);
			setStockForm({ quantite: '', observations: '' });
			setSelectedActifForStock(null);
			await fetchActifs();
		} catch (error) {
			console.error('Erreur lors de l\'ajout du stock:', error);
			alert('Erreur lors de l\'ajout du stock');
		} finally {
			setLoadingAddStock(false);
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
						<ActifsTableOrList loading={loading} actifs={actifs} dateFormat={dateFormat} isDesktop={isDesktop} onShowDetail={handleShowDetail} onOpenStockModal={handleOpenStockModal} />
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

							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">Prix unitaire (Ar)</label>
								<Input
									disabled
									value={selectedActifForStock?.prixUnitaire || '0'}
									className="border-neutral-300 bg-neutral-50"
								/>
							</div>

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
										onClick={() => setStockModalOpen(false)}
									>
										Annuler
									</Button>
									<Button
										onClick={handleAddStock}
										disabled={loadingAddStock}
									>
										{loadingAddStock ? 'Ajout en cours...' : 'Ajouter'}
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
								<div className="flex gap-2 justify-end">
									<Button variant="ghost" size="sm" onClick={() => onShowDetail(item.id)}>
										<InfoIcon className="w-5 h-5 text-violet-600" />
									</Button>
									<Button variant="ghost" size="sm" onClick={() => onOpenStockModal(item)}>
										+Stock
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
								<Button variant="ghost" size="sm" onClick={() => onOpenStockModal(item)}>+Stock</Button>
							</div>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}