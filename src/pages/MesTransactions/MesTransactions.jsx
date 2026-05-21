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
import { getMovementTypeBadgeProps } from '../../constants/transaction.enums';

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

        const res = await getUserTransactions(userId, params, token);

        // Traiter la réponse similaire aux autres services
        const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const totalCount = Number(res?.pagination?.total ?? res?.total ?? items.length);

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
      <h1 className="text-2xl mb-4">Mes transactions</h1>
      <p className="text-sm text-neutral-600">
        Liste de vos transactions
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-4 mb-4">
        <div className="w-44">
          <Select value={typeFilter} onValueChange={value => { setPage(1); setTypeFilter(value); }}>
            <SelectTrigger className="w-full border-neutral-300 bg-white min-w-0">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">Tous types</SelectItem>
              <SelectItem value="Dépôt">Dépôt</SelectItem>
              <SelectItem value="Retrait">Retrait</SelectItem>
              <SelectItem value="Initialisation">Initialisation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-40">
          <Select value={statusFilter} onValueChange={value => { setPage(1); setStatusFilter(value); }}>
            <SelectTrigger className="w-full border-neutral-300 bg-white min-w-0">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">Tous statuts</SelectItem>
              <SelectItem value="PENDING">PENDING</SelectItem>
              <SelectItem value="APPROVED">APPROVED</SelectItem>
              <SelectItem value="REJECTED">REJECTED</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-36 ml-auto">
          <Select value={order} onValueChange={value => { setPage(1); setOrder(value); }}>
            <SelectTrigger className="w-full border-neutral-300 bg-white min-w-0">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="desc">Plus récentes</SelectItem>
              <SelectItem value="asc">Plus anciennes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {loading ? (
        <div className="p-6 text-neutral-500">Chargement...</div>
      ) : (
        <>
          <Card className="border-neutral-200 bg-white">
            <TransactionsTableOrList loading={loading} transactions={transactions} isDesktop={isDesktop} dateFormat={dateFormat} />
          </Card>
          <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-4" />
        </>
      )}
    </div>
  );
};

export default MesTransactions;

function TransactionsTableOrList({ loading, transactions, isDesktop, dateFormat }) {
  if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
  if (!transactions || transactions.length === 0) return <div className="p-8 text-center text-neutral-400">Aucune transaction trouvée</div>;

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-neutral-600">N° Transaction</TableHead>
              <TableHead className="text-xs text-neutral-600">Produit</TableHead>
              <TableHead className="text-xs text-neutral-600">Types produits</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Quantité</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Stock Initial</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Stock Final</TableHead>
              <TableHead className="text-xs text-neutral-600">Type de transaction</TableHead>
              <TableHead className="text-xs text-neutral-600">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, idx) => {
              const transNumber = item.transactionNumber || '-';
              const produit = item.product || item.title || '-';
              const quantity = item.quantity ?? '-';
              const initialStock = item.initialStock ?? '-';
              const finalStock = item.finalStock ?? '-';
              const lieu = item.title || '-';
              const date = item.dateTime;

              const mvBadge = getMovementTypeBadgeProps(item.movementType);
              const badgeClass = mvBadge.className;
              const mvLabel = mvBadge.label;

              return (
                <TableRow key={item._id || item.transactionId || idx}>
                  <TableCell className="text-sm font-mono truncate max-w-xs">{transNumber}</TableCell>
                  <TableCell className="text-sm truncate max-w-xs">{produit}</TableCell>
                  <TableCell className="text-sm"><Badge className={`text-xs ${badgeClass} px-2 py-0.5 rounded`}>{mvLabel || item.movementType || '-'}</Badge></TableCell>
                  <TableCell className="text-sm text-right">{quantity !== '-' ? formatThousands(quantity) : '-'}</TableCell>
                  <TableCell className="text-sm text-right">{initialStock !== '-' ? formatThousands(initialStock) : '-'}</TableCell>
                  <TableCell className="text-sm text-right">{finalStock !== '-' ? formatThousands(finalStock) : '-'}</TableCell>
                  <TableCell className="text-sm truncate max-w-xs">{lieu}</TableCell>
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
      {transactions.map((item, idx) => {
        const transNumber = item.transactionNumber || '-';
        const produit = item.product || item.title || '-';
        const quantity = item.quantity ?? '-';
        const initialStock = item.initialStock ?? '-';
        const finalStock = item.finalStock ?? '-';
        const lieu = item.title || '-';
        const date = item.dateTime;

        const mvBadge = getMovementTypeBadgeProps(item.movementType);
        const badgeClass = mvBadge.className;
        const mvLabel = mvBadge.label;

        return (
          <Card key={item._id || item.transactionId || idx} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 truncate">{produit}</div>
                <div className="text-xs text-neutral-500">N°: {transNumber}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-600">
                  <div>Quantité: {quantity !== '-' ? formatThousands(quantity) : '-'}</div>
                  <div>Stock initial: {initialStock !== '-' ? formatThousands(initialStock) : '-'}</div>
                  <div>Stock final: {finalStock !== '-' ? formatThousands(finalStock) : '-'}</div>
                  <div>Lieu: {lieu}</div>
                  <div>{date ? dateFormat(date) : '-'}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`text-xs ${badgeClass} px-2 py-0.5 rounded`}>{mvLabel || item.movementType || '-'}</Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
