import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { getProfile } from '../../services/auth.service';
import { getUserTransactions } from '../../services/transaction.service';
import { getAccessToken } from '../../services/token.service';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import useScreenType from '../../utils/useScreenType';
import useDateFormat from '../../utils/useDateFormat.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';

// IMPORTATION DES ICÔNES MATERIAL DES SOUHAITÉES
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

  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Mes transactions</h1>
      <p className="text-sm text-neutral-600">
        Liste de vos transactions passées et en cours
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-6 mb-4">
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
        <div className="p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <SyncIcon className="animate-spin text-neutral-400" sx={{ fontSize: 32 }} />
          Chargement des données...
        </div>
      ) : (
        <>
          <Card className="border-neutral-200 bg-white shadow-sm overflow-hidden">
            <TransactionsTableOrList loading={loading} transactions={transactions} isDesktop={isDesktop} dateFormat={dateFormat} />
          </Card>
          <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />
        </>
      )}
    </div>
  );
};

export default MesTransactions;

// --- TABLEAU ET VUE MOBILE INTELLIGENTE ---

function TransactionsTableOrList({ loading, transactions, isDesktop, dateFormat }) {
  if (loading) return null;
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
              {/* <TableHead className="text-xs font-semibold text-neutral-600 text-right">Prix Unitaire</TableHead> */}
              <TableHead className="text-xs font-semibold text-neutral-600">Statut</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Lieu d'origine</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-600">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, idx) => {
              const transNumber = item.transactionNumber || item._id || '-';
              const produit = item.productId?.productName || item.productName || '-';
              const quantity = item.quantite ?? item.quantity ?? '-';
              // const prixUnitaire = item.prixUnitaire ?? '-';
              const type = item.type || item.movementType || '-';
              const status = item.status || '-';
              const lieu = item.siteOrigineId?.siteName || item.siteName || '-';
              const date = item.createdAt || item.approvedAt || item.dateTime;

              const typeBadge = getTypeBadgeProps(type);
              const statusBadge = getStatusBadgeProps(status);

              return (
                <TableRow key={item._id || item.transactionId || idx} className="hover:bg-neutral-50/50">
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
                  {/* <TableCell className="text-sm text-neutral-600 text-right">
                    {prixUnitaire !== '-' && prixUnitaire !== null ? `${safeFormat(prixUnitaire)} Ar` : '-'}
                  </TableCell> */}
                  <TableCell className="text-sm">
                    <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 ${statusBadge.className}`}>
                      <statusBadge.Icon sx={{ fontSize: 14 }} />
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600 truncate max-w-xs">{lieu}</TableCell>
                  <TableCell className="text-sm text-neutral-500">{date ? dateFormat(date) : '-'}</TableCell>
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
        const transNumber = item.transactionNumber || item._id || '-';
        const produit = item.productId?.productName || item.productName || '-';
        const quantity = item.quantite ?? item.quantity ?? '-';
        // const prixUnitaire = item.prixUnitaire ?? '-';
        const type = item.type || item.movementType || '-';
        const status = item.status || '-';
        const lieu = item.siteOrigineId?.siteName || item.siteName || '-';
        const date = item.createdAt || item.approvedAt || item.dateTime;

        const typeBadge = getTypeBadgeProps(type);
        const statusBadge = getStatusBadgeProps(status);

        return (
          <Card key={item._id || item.transactionId || idx} className="p-4 border-neutral-200 bg-white shadow-sm">
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
                {/* <div>
                  <span className="text-xs text-neutral-400 block">Prix Unitaire</span>
                  <span className="font-medium text-neutral-900">
                    {prixUnitaire !== '-' && prixUnitaire !== null ? `${safeFormat(prixUnitaire)} Ar` : '-'}
                  </span>
                </div> */}
                <div className="col-span-2">
                  <span className="text-xs text-neutral-400 block">Lieu d'origine</span>
                  <span className="text-neutral-700">{lieu}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="text-xs text-neutral-500 flex items-center gap-1">
                  <CalendarTodayIcon sx={{ fontSize: 12 }} className="text-neutral-400" />
                  {date ? dateFormat(date) : '-'}
                </div>
                <Badge variant="outline" className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 ${statusBadge.className}`}>
                  <statusBadge.Icon sx={{ fontSize: 14 }} />
                  {statusBadge.label}
                </Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}