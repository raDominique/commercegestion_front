import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { getStockHistory } from '../../services/stocks_move.service';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import useScreenType from '../../utils/useScreenType';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { formatThousands } from '../../utils/formatNumber.js';
import { Badge } from '../../components/ui/badge';

const MesTransactions = () => {
  const { user } = useAuth();
  usePageTitle('Mes transactions');

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useScreenType();
  const dateFormat = useDateFormat();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await getStockHistory({ limit: 10, page: 1 }, token);

        // Normalize different possible response shapes
        let items = [];
        if (Array.isArray(res)) items = res;
        else if (Array.isArray(res.data)) items = res.data;
        else if (Array.isArray(res.data?.data)) items = res.data.data;
        else if (Array.isArray(res.data?.items)) items = res.data.items;
        else if (Array.isArray(res.data?.rows)) items = res.data.rows;
        else if (Array.isArray(res.history)) items = res.history;
        else items = Array.isArray(res) ? res : (res.data || res) || [];

        setTransactions(Array.isArray(items) ? items : []);
      } catch (err) {
        console.error('getStockHistory error', err);
        toast.error('Erreur lors du chargement des transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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

      {loading ? (
        <div className="p-6 text-neutral-500">Chargement...</div>
      ) : (
        <Card className="border-neutral-200 bg-white">
          <TransactionsTableOrList loading={loading} transactions={transactions} isDesktop={isDesktop} dateFormat={dateFormat} />
        </Card>
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
              <TableHead className="text-xs text-neutral-600">Produit</TableHead>
              <TableHead className="text-xs text-neutral-600">Type</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Quantité</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Prix unitaire</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Montant</TableHead>
              <TableHead className="text-xs text-neutral-600">Départ</TableHead>
              <TableHead className="text-xs text-neutral-600">Arrivée</TableHead>
              <TableHead className="text-xs text-neutral-600">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, idx) => {
              const produit = item.productId?.productName || item.productId?.productName || item.productId?.codeCPC || item.productId?.id || '-';
              const quantite = item.quantite ?? '-';
              const prixUnitaire = item.prixUnitaire ?? null;
              const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
              const depart = item.siteOrigineId?.siteName || item.siteOrigineId || '-';
              const arrivee = item.siteDestinationId?.siteName || item.siteDestinationId || '-';
              const date = item.createdAt;
              const badgeClass = item.type === 'RETRAIT'
                ? 'bg-red-600 text-white border-red-700'
                : item.type === 'DEPOT'
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-neutral-200 text-neutral-700';

              return (
                <TableRow key={item._id || item.id || idx}>
                  <TableCell className="text-sm">{produit}</TableCell>
                  <TableCell className="text-sm"><Badge className={`text-xs ${badgeClass} px-2 py-0.5 rounded`}>{item.type || '-'}</Badge></TableCell>
                  <TableCell className="text-sm text-right">{quantite}</TableCell>
                  <TableCell className="text-sm text-right">{prixUnitaire !== null ? formatThousands(prixUnitaire) : '-'}</TableCell>
                  <TableCell className="text-sm text-right">{montant !== null ? formatThousands(montant) : '-'}</TableCell>
                  <TableCell className="text-sm">{depart}</TableCell>
                  <TableCell className="text-sm">{arrivee}</TableCell>
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
        const produit = item.productId?.productName || item.productId?.codeCPC || '-';
        const quantite = item.quantite ?? '-';
        const prixUnitaire = item.prixUnitaire ?? null;
        const montant = prixUnitaire !== null && quantite !== '-' ? quantite * prixUnitaire : null;
        const depart = item.siteOrigineId?.siteName || item.siteOrigineId || '-';
        const arrivee = item.siteDestinationId?.siteName || item.siteDestinationId || '-';
        const date = item.createdAt;
        const badgeClass = item.type === 'RETRAIT'
          ? 'bg-red-600 text-white border-red-700'
          : item.type === 'DEPOT'
            ? 'bg-green-600 text-white border-green-700'
            : 'bg-neutral-200 text-neutral-700';

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
                  <div>{date ? dateFormat(date) : '-'}</div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`text-xs ${badgeClass} px-2 py-0.5 rounded`}>{item.type || '-'}</Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
