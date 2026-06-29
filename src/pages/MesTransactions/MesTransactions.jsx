import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { getProfile } from '../../services/auth.service';
import { getUserTransactions, getTransactionById } from '../../services/transaction.service';
import { getAccessToken } from '../../services/token.service';
import { getMyVirements } from '../../services/ledger.service';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Card } from '../../components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import useScreenType from '../../utils/useScreenType';
import useDateFormat from '../../utils/useDateFormat.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';

// IMPORTATION DES ICÔNES MATERIAL
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SyncIcon from '@mui/icons-material/Sync';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InfoIcon from '@mui/icons-material/Info';
import { Loader } from '../../components/ui/loader';

// --- CONFIGURATION DU DESIGN SYSTEM ET DES TRADUCTIONS EN FR ---

const TYPE_CONFIG = {
  'INITIALIZATION': { label: 'Initialisation', className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50', Icon: SettingsIcon },
  'INITIALISATION': { label: 'Initialisation', className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50', Icon: SettingsIcon },
  'DEPOT': { label: 'Dépôt', className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50', Icon: ArrowDownwardIcon },
  'Dépôt': { label: 'Dépôt', className: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50', Icon: ArrowDownwardIcon },
  'RETRAIT': { label: 'Retrait', className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50', Icon: ArrowUpwardIcon },
  'Retrait': { label: 'Retrait', className: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50', Icon: ArrowUpwardIcon }
};

const STATUS_CONFIG = {
  'PENDING': { label: 'En attente', className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-50', Icon: ScheduleIcon },
  'APPROVED': { label: 'Approuvé', className: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-50', Icon: CheckCircleIcon },
  'REJECTED': { label: 'Rejeté', className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50', Icon: CancelIcon }
};

const getTypeBadgeProps = (type) => {
  return TYPE_CONFIG[type] || { label: type, className: 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-50', Icon: SwapHorizIcon };
};

const getStatusBadgeProps = (status) => {
  return STATUS_CONFIG[status] || { label: status, className: 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-50', Icon: HelpOutlineIcon };
};

// --- COMPOSANT PRINCIPAL ---

const MesTransactions = () => {
  const { user } = useAuth();
  usePageTitle('Mes transactions');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [order, setOrder] = useState('desc');
  const [productIdFilter, setProductIdFilter] = useState('');

  const { isDesktop } = useScreenType();
  const dateFormat = useDateFormat();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = getAccessToken() || localStorage.getItem('token');

        const params = {
          limit,
          page,
          sortBy: 'createdAt',
          order,
          type: typeFilter !== 'all' ? typeFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          productId: productIdFilter || undefined,
        };

        let userId = user?._id;
        if (!userId) {
          try {
            const profile = await getProfile();
            userId = profile?._id || profile?.id;
          } catch (e) {
            throw new Error("Impossible de récupérer l'identifiant utilisateur");
          }
        }

        const res = await getUserTransactions(userId, params, token);

        const items = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        const totalCount = Number(res?.data?.total ?? res?.total ?? res?.data?.pagination?.total ?? items.length);

        setTransactions(Array.isArray(items) ? items : []);
        setTotal(Number.isFinite(totalCount) ? totalCount : 0);
      } catch (err) {
        console.error('getUserTransactions error', err);
        toast.error('Erreur lors du chargement des transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [page, limit, typeFilter, statusFilter, order, productIdFilter]);

  // Fonction de gestion de l'action "Voir détails"
  const handleViewDetails = async (transactionId) => {
    setActionLoadingId(transactionId);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const res = await getTransactionById(transactionId, token);
      const raw = res?.data?.data || res?.data || res;
      const details = Array.isArray(raw) ? raw[0] : raw;
      setSelectedTransactionDetails(details || null);
      setDetailOpen(true);
    } catch (err) {
      console.error('getTransactionById error', err);
      toast.error('Erreur lors de la récupération des détails');
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- Virements tab data ---
  const [virementActifs, setVirementActifs] = useState([]);
  const [virementPassifs, setVirementPassifs] = useState([]);
  const [loadingVirements, setLoadingVirements] = useState(false);

  const fetchVirements = async () => {
    setLoadingVirements(true);
    try {
      const res = await getMyVirements();
      const data = res?.data?.data || res?.data || res;
      setVirementActifs(Array.isArray(data?.actifs) ? data.actifs : []);
      setVirementPassifs(Array.isArray(data?.passifs) ? data.passifs : []);
    } catch (err) {
      console.error('fetchVirements error', err);
      setVirementActifs([]);
      setVirementPassifs([]);
    } finally {
      setLoadingVirements(false);
    }
  };

  useEffect(() => { fetchVirements(); }, []);

  const renderPerson = (p) => {
    if (!p) return '-';
    if (typeof p === 'string') return p;
    return p.userNickName || p.userName || p.name || '-';
  };

  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto">
      <h1 className="text-2xl text-neutral-900 mb-2">Mes Transactions</h1>

      <Tabs defaultValue="transactions" className="mt-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="actifs">Mouvements des Actifs</TabsTrigger>
          <TabsTrigger value="passifs">Mouvements des Passifs</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <p className="text-sm text-neutral-600 mb-4">
            Liste de vos transactions passées et en cours
          </p>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="w-48">
              <Select value={typeFilter} onValueChange={value => { setPage(1); setTypeFilter(value); }}>
                <SelectTrigger className="w-full border-neutral-300 bg-white min-w-0">
                  <SelectValue placeholder="Filtrer par Type" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="DEPOT">Dépôt</SelectItem>
                  <SelectItem value="RETRAIT">Retrait</SelectItem>
                  <SelectItem value="INITIALIZATION">Initialisation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <Select value={statusFilter} onValueChange={value => { setPage(1); setStatusFilter(value); }}>
                <SelectTrigger className="w-full border-neutral-300 bg-white min-w-0">
                  <SelectValue placeholder="Filtrer par Statut" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="PENDING">En attente</SelectItem>
                  <SelectItem value="APPROVED">Approuvé</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-44 ml-auto">
              <Select value={order} onValueChange={value => { setPage(1); setOrder(value); }}>
                <SelectTrigger className="w-full border-neutral-300 bg-white min-w-0">
                  <SelectValue placeholder="Ordre d'affichage" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="desc">Plus récentes d'abord</SelectItem>
                  <SelectItem value="asc">Plus anciennes d'abord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader message="Chargement des données..." /></div>
          ) : (
            <>
              <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
                <TransactionsTableOrList
                  loading={loading}
                  transactions={transactions}
                  isDesktop={isDesktop}
                  dateFormat={dateFormat}
                  onViewDetails={handleViewDetails}
                  actionLoadingId={actionLoadingId}
                />
              </Card>
              {/* Modal détail transaction */}
              <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Détails de la transaction</DialogTitle>
                    <DialogDescription>Informations complètes de la transaction sélectionnée</DialogDescription>
                  </DialogHeader>
                  {selectedTransactionDetails ? (
                    <div className="space-y-3 text-sm">
                      <div><b>N° transaction :</b> {selectedTransactionDetails.transactionNumber || selectedTransactionDetails._id}</div>
                      <div><b>Type :</b> {selectedTransactionDetails.type || '-'}</div>
                      <div><b>Statut :</b> {selectedTransactionDetails.status || '-'}</div>
                      <div><b>Produit :</b> {selectedTransactionDetails.productId?.productName || selectedTransactionDetails.productName || '-'}</div>
                      <div><b>Code produit :</b> {selectedTransactionDetails.productId?.codeCPC || '-'}</div>
                      <div><b>Quantité :</b> {selectedTransactionDetails.quantite ?? '-'}</div>
                      <div><b>Prix unitaire :</b> {selectedTransactionDetails.prixUnitaire ?? '-'}</div>
                      <div><b>Initiateur :</b> {selectedTransactionDetails.initiatorId?.userNickName || selectedTransactionDetails.initiatorId?.userName || '-'}</div>
                      <div><b>Destinataire :</b> {selectedTransactionDetails.recipientId?.userNickName || selectedTransactionDetails.recipientId?.userName || '-'}</div>
                      <div><b>Site origine :</b> {selectedTransactionDetails.siteOrigineId?.siteName || '-'}</div>
                      <div><b>Date création :</b> {selectedTransactionDetails.createdAt ? dateFormat(selectedTransactionDetails.createdAt) : '-'}</div>
                      <div><b>Date approbation :</b> {selectedTransactionDetails.approvedAt ? dateFormat(selectedTransactionDetails.approvedAt) : '-'}</div>
                      <div><b>Observations :</b> {selectedTransactionDetails.observations || '-'}</div>
                    </div>
                  ) : (
                    <div className="flex justify-center py-8"><Loader message="Chargement..." /></div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <DialogClose asChild>
                      <Button variant="outline" status="inactive">Fermer</Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
              <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />
            </>
          )}
        </TabsContent>

        <TabsContent value="actifs">
          <p className="text-sm text-neutral-600 mb-4">
            Mouvements des actifs — droits de propriété
          </p>
          <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
            <MouvementsActifsTable
              loading={loadingVirements}
              actifs={virementActifs}
              dateFormat={dateFormat}
              renderPerson={renderPerson}
            />
          </Card>
        </TabsContent>

        <TabsContent value="passifs">
          <p className="text-sm text-neutral-600 mb-4">
            Mouvements des passifs — dettes et obligations
          </p>
          <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
            <MouvementsPassifsTable
              loading={loadingVirements}
              passifs={virementPassifs}
              dateFormat={dateFormat}
              renderPerson={renderPerson}
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MesTransactions;

// --- TABLEAU ET VUE MOBILE INTELLIGENTE ---

function TransactionsTableOrList({ loading, transactions, isDesktop, dateFormat, onViewDetails, actionLoadingId }) {
  if (loading) return <div className="flex justify-center py-8"><Loader /></div>;
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center gap-2">
        <ReceiptLongIcon className="text-neutral-300" sx={{ fontSize: 40 }} />
        Aucune transaction trouvée
      </div>
    );
  }

  const safeFormat = (val) => {
    if (val === '-' || val === null || val === undefined) return '-';
    return typeof formatThousands === 'function' ? formatThousands(val) : val;
  };

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-50/70">
            <TableRow>
              <TableHead className="text-xs font-semibold text-neutral-600">N° Transaction</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Produit</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Type de transaction</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600 text-right">Quantité</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Statut</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Lieu d'origine</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Date</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600 text-center w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, idx) => {
              const transId = item._id || item.transactionId;
              const transNumber = item.transactionNumber || item._id || '-';
              const produit = item.productId?.productName || item.productName || '-';
              const quantity = item.quantite ?? item.quantity ?? '-';
              const type = item.type || item.movementType || '-';
              const status = item.status || '-';
              const lieu = item.siteOrigineId?.siteName || item.siteName || '-';
              const date = item.createdAt || item.approvedAt || item.dateTime;

              const typeBadge = getTypeBadgeProps(type);
              const statusBadge = getStatusBadgeProps(status);
              const isItemLoading = actionLoadingId === transId;

              return (
                <TableRow key={transId || idx} className="hover:bg-neutral-50/50">
                  <TableCell className="text-sm font-mono text-neutral-700 truncate max-w-35" title={transNumber}>
                    {transNumber}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-neutral-900 truncate max-w-xs">{produit}</TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 ${typeBadge.className}`}>
                      <typeBadge.Icon sx={{ fontSize: 14 }} />
                      {typeBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-neutral-900 text-right">{safeFormat(quantity)} unité(s)</TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 ${statusBadge.className}`}>
                      <statusBadge.Icon sx={{ fontSize: 14 }} />
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600 truncate max-w-xs">{lieu}</TableCell>
                  <TableCell className="text-sm text-neutral-500">{date ? dateFormat(date) : '-'}</TableCell>
                  <TableCell className="text-sm text-center">
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 px-2 text-xs font-medium flex items-center gap-1 mx-auto"
                      disabled={isItemLoading || !transId}
                      onClick={() => onViewDetails(transId)}
                    >
                      {isItemLoading ? (
                        <Loader size="sm" className="border-primary border-t-transparent shrink-0" />
                      ) : (
                        <InfoIcon className="w-4 h-4 text-violet-600" />
                      )}
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

  // Version d'affichage pour Mobile (Cards)
  return (
    <div className="space-y-3 p-4 bg-neutral-50/50">
      {transactions.map((item, idx) => {
        const transId = item._id || item.transactionId;
        const transNumber = item.transactionNumber || item._id || '-';
        const produit = item.productId?.productName || item.productName || '-';
        const quantity = item.quantite ?? item.quantity ?? '-';
        const type = item.type || item.movementType || '-';
        const status = item.status || '-';
        const lieu = item.siteOrigineId?.siteName || item.siteName || '-';
        const date = item.createdAt || item.approvedAt || item.dateTime;

        const typeBadge = getTypeBadgeProps(type);
        const statusBadge = getStatusBadgeProps(status);
        const isItemLoading = actionLoadingId === transId;

        return (
          <Card key={transId || idx} className="p-4 border-neutral-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-neutral-900 text-base truncate">{produit}</div>
                  <div className="text-xs font-mono text-neutral-400 mt-0.5">N° {transNumber}</div>
                </div>
                <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 shrink-0 ${typeBadge.className}`}>
                  <typeBadge.Icon sx={{ fontSize: 12 }} />
                  {typeBadge.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-b border-neutral-100 py-2 text-sm">
                <div>
                  <span className="text-xs text-neutral-400 block">Quantité</span>
                  <span className="font-medium text-neutral-900">{safeFormat(quantity)} unité(s)</span>
                </div>
                <div>
                  <span className="text-xs text-neutral-400 block">Lieu d'origine</span>
                  <span className="text-neutral-700 truncate block max-w-35">{lieu}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <CalendarTodayIcon sx={{ fontSize: 12 }} className="text-neutral-400" />
                  {date ? dateFormat(date) : '-'}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 ${statusBadge.className}`}>
                    <statusBadge.Icon sx={{ fontSize: 14 }} />
                    {statusBadge.label}
                  </Badge>

                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-2 text-xs font-medium flex items-center gap-1"
                    disabled={isItemLoading || !transId}
                    onClick={() => onViewDetails(transId)}
                  >
                    {isItemLoading ? (
                      <Loader size="sm" className="border-primary border-t-transparent shrink-0" />
                    ) : (
                      <InfoIcon className="w-4 h-4 text-violet-600" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const formatDateMultiline = (dateStr) => {
  if (!dateStr) return ['-', ''];
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return ['-', ''];
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return [`${day}/${month}/${year}`, `à ${hours}:${minutes}`];
};

function MouvementsActifsTable({ loading, actifs, dateFormat, renderPerson }) {
  if (loading) return <div className="p-8 flex justify-center"><Loader message="Chargement..." /></div>;
  if (!actifs || actifs.length === 0) {
    return <div className="p-8 text-center text-neutral-400">Aucun mouvement d'actif trouvé</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-neutral-50/70">
          <TableRow>
            <TableHead className="text-xs font-semibold text-neutral-600">Membres</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Date et Heure</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">N° transaction</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Intitulé</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Produit / Article</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Détenteur</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Site</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600 text-right">Quantité</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600 text-right">Stock initial</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600 text-right">Stock final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actifs.map((item, idx) => {
            const date = item.dateTime;
            return (
              <TableRow key={item.numeroTransaction || item._id || idx} className="hover:bg-neutral-50/50">
                <TableCell className="text-sm text-neutral-900">{renderPerson(item.membre)}</TableCell>
                <TableCell className="text-sm text-neutral-500 whitespace-nowrap align-top">
                  {date ? (
                    <>
                      {formatDateMultiline(date)[0]}
                      <br />
                      {formatDateMultiline(date)[1]}
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-sm font-mono text-neutral-700">{item.numeroTransaction || '-'}</TableCell>
                <TableCell className="text-sm text-neutral-700">{item.title || 'Virement de droit'}</TableCell>
                <TableCell className="text-sm font-medium text-neutral-900 truncate max-w-xs">{item.product || '-'}</TableCell>
                <TableCell className="text-sm text-neutral-700">{renderPerson(item.detenteur)}</TableCell>
                <TableCell className="text-sm text-neutral-600 truncate max-w-xs">{item.site || '-'}</TableCell>
                <TableCell className={`text-sm font-medium text-right ${item.quantite >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {item.quantite ?? '-'}
                </TableCell>
                <TableCell className="text-sm text-right text-neutral-600">{item.stockInitial ?? '-'}</TableCell>
                <TableCell className="text-sm text-right text-neutral-600">{item.stockFinal ?? '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function MouvementsPassifsTable({ loading, passifs, dateFormat, renderPerson }) {
  if (loading) return <div className="p-8 flex justify-center"><Loader message="Chargement..." /></div>;
  if (!passifs || passifs.length === 0) {
    return <div className="p-8 text-center text-neutral-400">Aucun mouvement de passif trouvé</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-neutral-50/70">
          <TableRow>
            <TableHead className="text-xs font-semibold text-neutral-600">Membres</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Date et Heure</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">N° transaction</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Intitulé</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Produit / Article</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Ayant droit</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600">Site</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600 text-right">Quantité</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600 text-right">Stock initial</TableHead>
            <TableHead className="text-xs font-semibold text-neutral-600 text-right">Stock final</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passifs.map((item, idx) => {
            const date = item.dateTime;
            return (
              <TableRow key={item.numeroTransaction || item._id || idx} className="hover:bg-neutral-50/50">
                <TableCell className="text-sm text-neutral-900">{renderPerson(item.membre)}</TableCell>
                <TableCell className="text-sm text-neutral-500 whitespace-nowrap align-top">
                  {date ? (
                    <>
                      {formatDateMultiline(date)[0]}
                      <br />
                      {formatDateMultiline(date)[1]}
                    </>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-sm font-mono text-neutral-700">{item.numeroTransaction || '-'}</TableCell>
                <TableCell className="text-sm text-neutral-700">{item.title || 'Virement de droit'}</TableCell>
                <TableCell className="text-sm font-medium text-neutral-900 truncate max-w-xs">{item.product || '-'}</TableCell>
                <TableCell className="text-sm text-neutral-700">{renderPerson(item.ayantDroit)}</TableCell>
                <TableCell className="text-sm text-neutral-600 truncate max-w-xs">{item.site || '-'}</TableCell>
                <TableCell className={`text-sm font-medium text-right ${item.quantite >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {item.quantite ?? '-'}
                </TableCell>
                <TableCell className="text-sm text-right text-neutral-600">{item.stockInitial ?? '-'}</TableCell>
                <TableCell className="text-sm text-right text-neutral-600">{item.stockFinal ?? '-'}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}