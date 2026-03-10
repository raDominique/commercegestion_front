import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import useScreenType from '../../utils/useScreenType';
import { formatThousands } from '../../utils/formatNumber';
import { getMyStocksPassifs } from '../../services/stocks_move.service';
import usePageTitle from '../../utils/usePageTitle.jsx';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const Retrait = () => {
	const { user } = useAuth();
	const dateFormat = useDateFormat();

	usePageTitle('Retrait');

	const [passifs, setPassifs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [total, setTotal] = useState(0);

	/* ================= FETCH ================= */

	const fetchPassifs = async () => {
		setLoading(true);

		try {
			const token = localStorage.getItem('token');
			const params = { limit, page };
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

	/* ================= AFFICHAGE ================= */

	return (
		<div className="px-6 mx-auto">
			{user && user.userValidated === false ? (
				<UserNotValidatedBanner />
			) : (
				<>
					<div className="space-y-6">
						<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<div>
								<h1 className="text-2xl text-neutral-900 mb-2">Mes Retraits</h1>
								<p className="text-sm text-neutral-600">Historique de vos retraits</p>
							</div>
						</div>

						<div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
							<div className="relative flex-1 min-w-0">
								<SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
								<Input
									placeholder="Rechercher..."
									value={search}
									onChange={(e) => {
										setPage(1);
										setSearch(e.target.value);
									}}
									className="pl-10 border-black bg-white w-full"
								/>
							</div>
						</div>

						{/* TABLEAU */}
						<Card className="border-neutral-200 bg-white">
							<RetraitTableOrList loading={loading} passifs={passifs} dateFormat={dateFormat} />
						</Card>

						{/* PAGINATION */}
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
					</div>
				</>
			)}
		</div>
	);
};

function RetraitTableOrList({ loading, passifs, dateFormat }) {
	const { isDesktop } = useScreenType();

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
							<TableHead className="text-xs text-neutral-600">Type</TableHead>
							<TableHead className="text-xs text-neutral-600">Quantité</TableHead>
							<TableHead className="text-xs text-neutral-600">Prix unitaire (Ar)</TableHead>
							<TableHead className="text-xs text-neutral-600">Total (Ar)</TableHead>
							<TableHead className="text-xs text-neutral-600">Départ</TableHead>
							<TableHead className="text-xs text-neutral-600">Arrivée</TableHead>
							<TableHead className="text-xs text-neutral-600">Détenteur</TableHead>
							<TableHead className="text-xs text-neutral-600">Ayant droit</TableHead>
							<TableHead className="text-xs text-neutral-600">Date</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{passifs.map((item, idx) => {
							const produit = item.productId?.productName || item.productId?.codeCPC || '-';
							const quantite = item.quantite ?? '-';
							const prixUnitaire = item.prixUnitaire ?? null;
							const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
							const depart = item.siteOrigineId?.siteName || '-';
							const arrivee = item.siteDestinationId?.siteName || '-';
							const detenteur = item.detentaire?.userNickName || item.operatorId?.userNickName || '-';
							const ayantDroit = item.ayant_droit?.userNickName || '-';
							const date = item.createdAt;

							return (
								<TableRow key={idx}>
									<TableCell className="text-sm font-semibold text-neutral-900">{produit}</TableCell>
									<TableCell className="text-sm text-neutral-600">{item.type || '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600">{quantite}</TableCell>
									<TableCell className="text-sm text-neutral-600">{prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600">{montant !== null ? formatThousands(montant) : '-'}</TableCell>
									<TableCell className="text-sm text-neutral-600">{depart}</TableCell>
									<TableCell className="text-sm text-neutral-600">{arrivee}</TableCell>
									<TableCell className="text-sm text-neutral-600">{detenteur}</TableCell>
									<TableCell className="text-sm text-neutral-600">{ayantDroit}</TableCell>
									<TableCell className="text-sm text-neutral-600">{date ? dateFormat(date) : '-'}</TableCell>
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
				const depart = item.siteOrigineId?.siteName || '-';
				const arrivee = item.siteDestinationId?.siteName || '-';
				const detenteur = item.detentaire?.userNickName || item.operatorId?.userNickName || '-';
				const ayantDroit = item.ayant_droit?.userNickName || '-';
				const date = item.createdAt;

				return (
					<Card key={idx} className="p-4">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-3">
									<div className="min-w-0">
										<div className="font-medium text-neutral-900 truncate">{produit}</div>
										<div className="text-xs text-neutral-500 truncate">{item.type || '-'}</div>
									</div>
								</div>
								<div className="mt-3 flex flex-wrap items-center gap-2">
									<div className="text-sm text-neutral-900">Quantité: {quantite}</div>
									<div className="text-sm text-neutral-600">Prix unitaire: {prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</div>
									<div className="text-sm text-neutral-600">Montant: {montant !== null ? formatThousands(montant) : '-'}</div>
									<div className="text-sm text-neutral-600">Départ: {depart}</div>
									<div className="text-sm text-neutral-600">Arrivée: {arrivee}</div>
									<div className="text-sm text-neutral-600">Détenteur: {detenteur}</div>
									<div className="text-sm text-neutral-600">Ayant droit: {ayantDroit}</div>
									<div className="text-sm text-neutral-600">{date ? dateFormat(date) : '-'}</div>
								</div>
							</div>
							<div className="flex flex-col items-end gap-2">
								<Button variant="ghost" size="sm" aria-label={`Détail ${idx}`}>
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