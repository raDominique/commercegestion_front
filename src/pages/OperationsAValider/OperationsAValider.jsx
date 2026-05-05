import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getPendingTransactionsList, approveTransaction, rejectTransaction, getTransactionById } from '../../services/transaction.service';
import { getProfile } from '../../services/auth.service';
import { getAccessToken } from '../../services/token.service';
import { toast } from 'sonner';
import useScreenType from '../../utils/useScreenType';
import useDateFormat from '../../utils/useDateFormat.jsx';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { formatThousands } from '../../utils/formatNumber.js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';

const OperationsAValider = () => {
  usePageTitle('Opérations à valider');
  const { user } = useAuth();

  const [pendingTransactions, setPendingTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // États pour la gestion des actions
  const [actionLoading, setActionLoading] = useState(false);
  const [actionTransactionId, setActionTransactionId] = useState(null);
  
  // États pour le dialog d'approbation
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedTransactionForApprove, setSelectedTransactionForApprove] = useState(null);
  const [observations, setObservations] = useState('');
  
  // États pour le dialog de rejet
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedTransactionForReject, setSelectedTransactionForReject] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');

  const { isDesktop } = useScreenType();
  const dateFormat = useDateFormat();

  // Charger les transactions en attente
  useEffect(() => {
    const fetchPendingTransactions = async () => {
      setLoading(true);
      try {
        // Récupérer l'userId via le contexte ou l'API getProfile
        let userId = user?._id;
        if (!userId) {
          try {
            const profile = await getProfile();
            userId = profile?._id || profile?.id;
          } catch (e) {
            throw new Error("Impossible de récupérer l'identifiant utilisateur");
          }
        }

        const token = getAccessToken();
        if (!token) {
          toast.error('Token d\'authentification manquant');
          return;
        }

        const params = {
          userId,
          page,
          limit,
        };

        const res = await getPendingTransactionsList(params, token);
        console.log('getPendingTransactionsList response:', res);

        let items = [];
        let totalCount = 0;

        // Traiter la réponse - axios enveloppe dans res.data
        // Structure: res.data = { status, message, data[], page, limit, total }
        if (res?.data?.data && Array.isArray(res.data.data)) {
          items = res.data.data;
          totalCount = res.data.total || 0;
        } else if (res?.data && Array.isArray(res.data)) {
          items = res.data;
        } else if (Array.isArray(res)) {
          items = res;
        }

        setPendingTransactions(Array.isArray(items) ? items : []);
        setTotal(Number.isFinite(totalCount) ? totalCount : 0);
      } catch (err) {
        console.error('getPendingTransactionsList error', err);
        toast.error('Erreur lors du chargement des opérations à valider');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingTransactions();
  }, [page, limit, user]);

  // Rafraîchir la liste des transactions
  const refreshPendingTransactions = async () => {
    setLoading(true);
    try {
      let userId = user?._id;
      if (!userId) {
        const profile = await getProfile();
        userId = profile?._id || profile?.id;
      }

      const token = getAccessToken();
      const params = { userId, page, limit };
      const res = await getPendingTransactionsList(params, token);

      let items = [];
      let totalCount = 0;

      // Traiter la réponse - axios enveloppe dans res.data
      if (res?.data?.data && Array.isArray(res.data.data)) {
        items = res.data.data;
        totalCount = res.data.total || 0;
      } else if (res?.data && Array.isArray(res.data)) {
        items = res.data;
      } else if (Array.isArray(res)) {
        items = res;
      }

      setPendingTransactions(Array.isArray(items) ? items : []);
      setTotal(Number.isFinite(totalCount) ? totalCount : 0);
    } catch (err) {
      console.error('Error refreshing pending transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Ouvrir le dialog d'approbation
  const handleOpenApproveDialog = (transaction) => {
    setSelectedTransactionForApprove(transaction);
    setIsApproveDialogOpen(true);
    setObservations('');
  };

  // Confirmer l'approbation
  const handleConfirmApprove = async () => {
    if (!selectedTransactionForApprove) return;

    setActionLoading(true);
    setActionTransactionId(selectedTransactionForApprove._id);
    try {
      let userId = user?._id;
      if (!userId) {
        const profile = await getProfile();
        userId = profile?._id || profile?.id;
      }

      const token = getAccessToken();
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }

      await approveTransaction(selectedTransactionForApprove._id, {
        approuveurId: userId,
        observations: observations || '',
      }, token);

      toast.success('Transaction approuvée');
      refreshPendingTransactions();
      setIsApproveDialogOpen(false);
      setSelectedTransactionForApprove(null);
      setObservations('');
    } catch (err) {
      console.error('Error approving transaction:', err);
      toast.error('Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
      setActionTransactionId(null);
    }
  };

  // Ouvrir le dialog de rejet
  const handleOpenRejectDialog = (transaction) => {
    setSelectedTransactionForReject(transaction);
    setIsRejectDialogOpen(true);
    setMotifRejet('');
  };

  // Confirmer le rejet
  const handleConfirmReject = async () => {
    if (!motifRejet.trim()) {
      toast.error('Le motif du rejet est obligatoire');
      return;
    }

    if (!selectedTransactionForReject) return;

    setActionLoading(true);
    setActionTransactionId(selectedTransactionForReject._id);
    try {
      let userId = user?._id;
      if (!userId) {
        const profile = await getProfile();
        userId = profile?._id || profile?.id;
      }

      const token = getAccessToken();
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }

      await rejectTransaction(selectedTransactionForReject._id, {
        approuveurId: userId,
        motifRejet: motifRejet,
      }, token);

      toast.success('Transaction rejetée');
      refreshPendingTransactions();
      setIsRejectDialogOpen(false);
      setSelectedTransactionForReject(null);
      setMotifRejet('');
    } catch (err) {
      console.error('Error rejecting transaction:', err);
      toast.error('Erreur lors du rejet');
    } finally {
      setActionLoading(false);
      setActionTransactionId(null);
    }
  };

  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  return (
    <div className="px-6 mx-auto space-y-4">
      <div>
        <h1 className="text-2xl text-neutral-900">Opérations à valider</h1>
        <p className="text-sm text-neutral-600">Consultez les opérations en attente de validation ({total}).</p>
      </div>

      {loading ? (
        <Card className="border-neutral-200 bg-white p-6">
          <div className="text-neutral-600">Chargement...</div>
        </Card>
      ) : pendingTransactions.length > 0 ? (
        <>
          <Card className="border-neutral-200 bg-white">
            <PendingTransactionsTable 
              loading={loading} 
              transactions={pendingTransactions} 
              isDesktop={isDesktop} 
              dateFormat={dateFormat}
              onApprove={handleOpenApproveDialog}
              onReject={handleOpenRejectDialog}
              actionLoading={actionLoading}
              actionTransactionId={actionTransactionId}
            />
          </Card>
          <div className="flex justify-end items-center gap-4">
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
        </>
      ) : (
        <Card className="border-neutral-200 bg-white p-6 text-center text-neutral-500">
          Aucune opération à valider pour le moment.
        </Card>
      )}

      {/* Dialog d'approbation */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Approuver la transaction</DialogTitle>
            <DialogDescription>
              N° Transaction: {selectedTransactionForApprove?.transactionNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3 pb-2">
              <div className="text-sm text-neutral-700">
                <div className="font-medium">Produit:</div>
                <div className="text-neutral-600">{selectedTransactionForApprove?.productId?.productName}</div>
              </div>
              <div className="text-sm text-neutral-700">
                <div className="font-medium">Quantité:</div>
                <div className="text-neutral-600">{selectedTransactionForApprove?.quantite} unités</div>
              </div>
              <div className="text-sm text-neutral-700">
                <div className="font-medium">Initié par:</div>
                <div className="text-neutral-600">
                  {selectedTransactionForApprove?.initiatorId?.userNickName || selectedTransactionForApprove?.initiatorId?.userName}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="observations">Observations (optionnel)</Label>
              <Input
                id="observations"
                placeholder="Ajouter des observations sur cette approbation"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="border-neutral-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button 
              variant="default" 
              onClick={handleConfirmApprove}
              disabled={actionLoading}
            >
              {actionLoading ? 'Approbation en cours...' : 'Approuver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Rejeter la transaction</DialogTitle>
            <DialogDescription>
              N° Transaction: {selectedTransactionForReject?.transactionNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-3 pb-2">
              <div className="text-sm text-neutral-700">
                <div className="font-medium">Produit:</div>
                <div className="text-neutral-600">{selectedTransactionForReject?.productId?.productName}</div>
              </div>
              <div className="text-sm text-neutral-700">
                <div className="font-medium">Quantité:</div>
                <div className="text-neutral-600">{selectedTransactionForReject?.quantite} unités</div>
              </div>
              <div className="text-sm text-neutral-700">
                <div className="font-medium">Initié par:</div>
                <div className="text-neutral-600">
                  {selectedTransactionForReject?.initiatorId?.userNickName || selectedTransactionForReject?.initiatorId?.userName}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motifRejet" required>Motif du rejet</Label>
              <Input
                id="motifRejet"
                placeholder="Veuillez indiquer le motif du rejet"
                value={motifRejet}
                onChange={(e) => setMotifRejet(e.target.value)}
                className="border-neutral-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={actionLoading}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmReject}
              disabled={actionLoading || !motifRejet.trim()}
            >
              {actionLoading ? 'Rejet en cours...' : 'Confirmer le rejet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OperationsAValider;

function PendingTransactionsTable({ loading, transactions, isDesktop, dateFormat, onApprove, onReject, actionLoading, actionTransactionId }) {
  if (loading) return <div className="p-8 text-center text-neutral-400">Chargement...</div>;
  if (!transactions || transactions.length === 0) return <div className="p-8 text-center text-neutral-400">Aucune opération à valider</div>;

  if (isDesktop) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-neutral-600">N° Transaction</TableHead>
              <TableHead className="text-xs text-neutral-600">Produit</TableHead>
              <TableHead className="text-xs text-neutral-600">Type</TableHead>
              <TableHead className="text-xs text-neutral-600 text-right">Quantité</TableHead>
              <TableHead className="text-xs text-neutral-600">Initié par</TableHead>
              <TableHead className="text-xs text-neutral-600">Statut</TableHead>
              <TableHead className="text-xs text-neutral-600">Date</TableHead>
              <TableHead className="text-xs text-neutral-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((item, idx) => {
              const badgeClass = item.type === 'RETOUR'
                ? 'bg-blue-600 text-white border-blue-700'
                : item.type === 'DÉPÔT'
                  ? 'bg-green-600 text-white border-green-700'
                  : item.type === 'RETRAIT'
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-neutral-200 text-neutral-700';
              
              const statusClass = item.status === 'PENDING'
                ? 'bg-orange-600 text-white border-orange-700'
                : item.status === 'APPROVED'
                  ? 'bg-green-600 text-white border-green-700'
                  : item.status === 'REJECTED'
                    ? 'bg-red-600 text-white border-red-700'
                    : 'bg-neutral-200 text-neutral-700';

              const initiatorName = item.initiatorId?.userNickName || item.initiatorId?.userName || '-';
              const productName = item.productId?.productName || '-';
              const quantite = item.quantite || 0;
              const isActioning = actionLoading && actionTransactionId === item._id;

              return (
                <TableRow key={item._id || item.id || idx}>
                  <TableCell className="text-sm font-mono">{item.transactionNumber || '-'}</TableCell>
                  <TableCell className="text-sm">{productName}</TableCell>
                  <TableCell className="text-sm"><Badge className={`text-xs ${badgeClass} px-2 py-0.5 rounded`}>{item.type || '-'}</Badge></TableCell>
                  <TableCell className="text-sm text-right">{quantite ? formatThousands(quantite) : '-'}</TableCell>
                  <TableCell className="text-sm">{initiatorName}</TableCell>
                  <TableCell className="text-sm"><Badge className={`text-xs ${statusClass} px-2 py-0.5 rounded`}>{item.status || '-'}</Badge></TableCell>
                  <TableCell className="text-sm">{item.createdAt ? dateFormat(item.createdAt) : '-'}</TableCell>
                  <TableCell className="text-sm">
                    {item.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button 
                          size="xs" 
                          variant="default"
                          disabled={isActioning}
                          onClick={() => onApprove(item)}
                        >
                          {isActioning ? 'En cours...' : 'Approuver'}
                        </Button>
                        <Button 
                          size="xs" 
                          variant="outline"
                          disabled={isActioning}
                          onClick={() => onReject(item)}
                        >
                          {isActioning ? 'En cours...' : 'Rejeter'}
                        </Button>
                      </div>
                    )}
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
      {transactions.map((item, idx) => {
        const badgeClass = item.type === 'RETOUR'
          ? 'bg-blue-600 text-white border-blue-700'
          : item.type === 'DÉPÔT'
            ? 'bg-green-600 text-white border-green-700'
            : item.type === 'RETRAIT'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-neutral-200 text-neutral-700';
        
        const statusClass = item.status === 'PENDING'
          ? 'bg-orange-600 text-white border-orange-700'
          : item.status === 'APPROVED'
            ? 'bg-green-600 text-white border-green-700'
            : item.status === 'REJECTED'
              ? 'bg-red-600 text-white border-red-700'
              : 'bg-neutral-200 text-neutral-700';

        const initiatorName = item.initiatorId?.userNickName || item.initiatorId?.userName || '-';
        const productName = item.productId?.productName || '-';
        const quantite = item.quantite || 0;
        const isActioning = actionLoading && actionTransactionId === item._id;

        return (
          <Card key={item._id || item.id || idx} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-neutral-900 truncate">{productName}</div>
                <div className="text-xs text-neutral-500">N°: {item.transactionNumber || '-'}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-neutral-600">
                  <div>Quantité: {quantite ? formatThousands(quantite) : '-'}</div>
                  <div>Prix U.: {item.prixUnitaire ? formatThousands(item.prixUnitaire) : '-'}</div>
                  <div>Initié par: {initiatorName}</div>
                  <div>{item.createdAt ? dateFormat(item.createdAt) : '-'}</div>
                </div>
                {item.status === 'PENDING' && (
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="default"
                      disabled={isActioning}
                      onClick={() => onApprove(item)}
                    >
                      {isActioning ? 'En cours...' : 'Approuver'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={isActioning}
                      onClick={() => onReject(item)}
                    >
                      {isActioning ? 'En cours...' : 'Rejeter'}
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`text-xs ${badgeClass} px-2 py-0.5 rounded`}>{item.type || '-'}</Badge>
                <Badge className={`text-xs ${statusClass} px-2 py-0.5 rounded`}>{item.status || '-'}</Badge>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
