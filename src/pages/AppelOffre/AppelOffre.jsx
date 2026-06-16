import React from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { getTenders, getTenderById, getMyTenders, createTender, deleteTender, createBid, openSealedBids, awardTender, getBids } from '../../services/appeloffre.service';
import { getFullMediaUrl } from '../../services/media.service';
import { getAccessToken } from '../../services/token.service';
import { selectAllProduits } from '../../services/product.service';
import { getMySites } from '../../services/site.service';

const AppelOffre = () => {
  usePageTitle("Appels d'offre");

  return (
    <div className="px-6 mx-auto">
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">Tous les appels d'offres</TabsTrigger>
          <TabsTrigger value="form">Mes appels d'offre</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card className="border-neutral-200 bg-white">
            <div className="p-4">
              <TendersList />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card className="border-neutral-200 bg-white">
            <div className="p-4">
              <MyTendersList />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppelOffre;

const statusColor = (statut) => {
  const map = {
    OUVERT: 'bg-green-100 text-green-800 border-green-200',
    EN_ATTENTE: 'bg-amber-100 text-amber-800 border-amber-200',
    DEPOUILLE: 'bg-blue-100 text-blue-800 border-blue-200',
    ATTRIBUE: 'bg-purple-100 text-purple-800 border-purple-200',
    ANNULE: 'bg-red-100 text-red-800 border-red-200',
  };
  return map[statut] || 'bg-neutral-100 text-neutral-800 border-neutral-200';
};

function TendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [statut, setStatut] = useState('ALL');
  const [total, setTotal] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTender, setDetailTender] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [bidOpen, setBidOpen] = useState(false);
  const [bidTenderId, setBidTenderId] = useState(null);

  const handleView = async (id) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const res = await getTenderById(id, token);
      const tenderData = res?.data?.data || res?.data || res;
      setDetailTender(Array.isArray(tenderData) ? tenderData[0] : tenderData);
    } catch (err) {
      console.error('getTenderById error', err);
      setDetailTender(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = getAccessToken() || localStorage.getItem('token');
        const params = { page, limit, search, sortBy: sort, order };
        if (statut && statut !== 'ALL') params.statut = statut;
        const res = await getTenders(params, token);
        const items = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
        setTenders(items || []);
        setTotal(Number(res?.data?.total ?? res?.total ?? 0));
      } catch (err) {
        console.error('getTenders error', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [page, limit, statut, search, sort, order]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="w-full md:w-64">
          <Input
            type="text"
            placeholder="Rechercher par titre"
            className="bg-white"
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
          />
        </div>

        <div className="w-full md:w-48">
          <Select value={sort} onValueChange={v => { setPage(1); setSort(v); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Date de création</SelectItem>
              <SelectItem value="title">Titre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-40">
          <Select value={order} onValueChange={v => { setPage(1); setOrder(v); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descendant</SelectItem>
              <SelectItem value="asc">Ascendant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-24">
          <Select value={String(limit)} onValueChange={v => { setPage(1); setLimit(Number(v)); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Limite" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map(n => (
                <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-44">
          <Select value={statut} onValueChange={v => { setPage(1); setStatut(v); }}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="OUVERT">OUVERT</SelectItem>
              <SelectItem value="EN_ATTENTE">EN ATTENTE</SelectItem>
              <SelectItem value="DEPOUILLE">DEPOUILLE</SelectItem>
              <SelectItem value="ATTRIBUE">ATTRIBUE</SelectItem>
              <SelectItem value="ANNULE">ANNULE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-neutral-500">Chargement des appels d'offre...</div>
      ) : !tenders || tenders.length === 0 ? (
        <div className="text-center text-neutral-400 py-12">Aucun appel d'offre trouvé</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tenders.map(item => {
          const product = item.productId || {};
          return (
            <Card key={item._id} className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
              <CardHeader className="p-0">
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-neutral-900 truncate">{item.titre}</CardTitle>
                    <Badge className={`shrink-0 mt-0.5 ${statusColor(item.statut || '')}`}>
                      {(item.statut || '').replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 py-3 pt-0">
                <div className="flex flex-col gap-2">
                  <div className="text-sm text-neutral-700"><span className="font-bold">Produit:</span> {product.productName || '-'}</div>
                  <div className="text-sm text-neutral-700"><span className="font-bold">Quantité:</span> {item.quantite} {item.unite}</div>
                  <div className="text-sm text-neutral-700"><span className="font-bold">Date limite:</span> {item.dateLimite ? new Date(item.dateLimite).toLocaleDateString('fr-FR') : '-'}</div>
                  {item.lanceurId?.userNickName && <div className="text-sm text-neutral-700"><span className="font-bold">Lanceur:</span> {item.lanceurId.userNickName}</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button className="flex-1" status="active" color="default" onClick={() => handleView(item._id)}>Voir</Button>
                  <Button className="flex-1" status="active" color="default" onClick={() => { setBidTenderId(item._id); setBidOpen(true); }}>Soumissionner</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</button>
          <div className="text-sm text-neutral-600">Page {page} / {Math.max(1, Math.ceil(total / limit))}</div>
          <button className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
      </div>
        </>
      )}

      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setDetailTender(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail de l'appel d'offre</DialogTitle>
            <DialogDescription>Informations détaillées</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 text-center text-neutral-500">Chargement...</div>
          ) : detailTender ? (
            <div className="space-y-3 text-sm">
              {detailTender.productId?.productImage && (
                <div className="flex justify-center mb-4">
                  <img
                    src={getFullMediaUrl(detailTender.productId.productImage)}
                    alt={detailTender.productId.productName}
                    className="w-full max-h-48 object-cover rounded"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-base text-neutral-900">{detailTender.titre}</div>
                <Badge className={`shrink-0 mt-0.5 ${statusColor(detailTender.statut || '')}`}>
                  {(detailTender.statut || '').replace('_', ' ')}
                </Badge>
              </div>
              <div><b>Description :</b> {detailTender.description || '-'}</div>
              <div><b>Produit :</b> {detailTender.productId?.productName || '-'}</div>
              <div><b>Code CPC :</b> {detailTender.productId?.codeCPC || '-'}</div>
              <div><b>Quantité :</b> {detailTender.quantite} {detailTender.unite}</div>
              <div><b>Lanceur :</b> {detailTender.lanceurId?.userNickName} {detailTender.lanceurId?.userName || ''}</div>
              <div><b>Site de livraison :</b> {detailTender.siteLivraison?.siteName || '-'}</div>
              <div><b>Adresse :</b> {detailTender.siteLivraison?.siteAddress || '-'}</div>
              <div><b>Conditions de paiement :</b> {detailTender.conditionsPaiement || '-'}</div>
              <div><b>Délai de livraison :</b> {detailTender.delaiLivraisonSouhaite || '-'}</div>
              <div><b>Date limite :</b> {detailTender.dateLimite ? new Date(detailTender.dateLimite).toLocaleDateString('fr-FR') : '-'}</div>
              <div><b>Date de dépouillement :</b> {detailTender.dateDepouillement ? new Date(detailTender.dateDepouillement).toLocaleDateString('fr-FR') : '-'}</div>
              <div><b>Date de création :</b> {detailTender.createdAt ? new Date(detailTender.createdAt).toLocaleDateString('fr-FR') : '-'}</div>
              {detailTender.documentPieces && (
                <div>
                  <a href={detailTender.documentPieces} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Voir le document
                  </a>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" status="inactive">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BidModal
        open={bidOpen}
        onOpenChange={(open) => { setBidOpen(open); if (!open) setBidTenderId(null); }}
        tenderId={bidTenderId}
      />
    </div>
  );
}



function MyTendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTender, setDetailTender] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bidsOpen, setBidsOpen] = useState(false);
  const [bidsTenderId, setBidsTenderId] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [awardTarget, setAwardTarget] = useState(null);
  const [awardLoading, setAwardLoading] = useState(false);

  const handleView = async (id) => {
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const res = await getTenderById(id, token);
      const tenderData = res?.data?.data || res?.data || res;
      setDetailTender(Array.isArray(tenderData) ? tenderData[0] : tenderData);
    } catch (err) {
      console.error('getTenderById error', err);
      setDetailTender(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      await deleteTender(deleteTargetId, token);
      toast.success("Appel d'offre annulé avec succès");
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
      fetchTenders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenSealed = async (id) => {
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      await openSealedBids(id, token);
      toast.success("Dépouillement ouvert avec succès");
      fetchTenders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'ouverture du dépouillement");
    }
  };

  const handleViewBids = async (id) => {
    setBidsTenderId(id);
    setBidsLoading(true);
    setBidsOpen(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const res = await getBids(id, token);
      const items = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setBids(items || []);
    } catch (err) {
      console.error('getBids error', err);
      setBids([]);
    } finally {
      setBidsLoading(false);
    }
  };

  const handleAward = async () => {
    if (!awardTarget) return;
    setAwardLoading(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      await awardTender(awardTarget.tenderId, { soumissionId: awardTarget.bidId, commentaire: awardTarget.commentaire }, token);
      toast.success("Appel d'offre attribué avec succès");
      setAwardTarget(null);
      setBidsOpen(false);
      fetchTenders();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'attribution");
    } finally {
      setAwardLoading(false);
    }
  };

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const res = await getMyTenders({ page, limit }, token);
      const items = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setTenders(items || []);
      setTotal(Number(res?.data?.total ?? res?.total ?? 0));
    } catch (err) {
      console.error('getMyTenders error', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchTenders();
  }, [fetchTenders]);

  if (loading) return <div className="p-6">Chargement des appels d'offre...</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button color="default">Nouvel appel d'offre</Button>
          </DialogTrigger>
          <CreateTenderModal onSuccess={() => { setModalOpen(false); fetchTenders(); }} />
        </Dialog>
      </div>

      {!tenders || tenders.length === 0 ? (
        <div className="p-6 text-neutral-500">Aucun appel d'offre trouvé</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-neutral-600">
                <th className="py-2">Titre</th>
                <th className="py-2">Statut</th>
                <th className="py-2">Créé le</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tenders.map((t) => (
                <tr key={t._id} className="border-t">
                  <td className="py-3">{t.titre || t._id}</td>
                  <td className="py-3">
                    <Badge className={statusColor(t.statut || '')}>{(t.statut || '').replace('_', ' ')}</Badge>
                  </td>
                  <td className="py-3">{t.createdAt ? new Date(t.createdAt).toLocaleString('fr-FR') : '-'}</td>
                  <td className="py-3">
                    <div className="flex gap-1 items-center">
                      <Button variant="ghost" size="sm" onClick={() => handleView(t._id)} className="text-xs gap-1">
                        <InfoIcon className="w-4 h-4 text-violet-600" /> Détails
                      </Button>
                      {t.statut === 'OUVERT' && (
                        <Button variant="ghost" size="sm" onClick={() => handleOpenSealed(t._id)} className="text-xs gap-1">
                          <HowToVoteIcon className="w-4 h-4 text-orange-500" /> Dépouiller
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" disabled={t.statut !== 'OUVERT'} className={`text-xs gap-1 ${t.statut !== 'OUVERT' ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => handleViewBids(t._id)}>
                        <CheckCircleIcon className={`w-4 h-4 ${t.statut !== 'OUVERT' ? 'text-neutral-400' : 'text-green-600'}`} /> Soumissions
                      </Button>
                      <Button variant="ghost" size="sm" disabled={t.statut !== 'OUVERT'} className={`text-xs gap-1 ${t.statut !== 'OUVERT' ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => { setDeleteTargetId(t._id); setDeleteConfirmOpen(true); }}>
                        <DeleteIcon className={`w-4 h-4 ${t.statut !== 'OUVERT' ? 'text-neutral-400' : 'text-red-600'}`} /> Supprimer
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="px-3 py-1 border rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</button>
        <span className="text-sm text-neutral-600">Page {page} / {Math.max(1, Math.ceil(total / limit))}</span>
        <button className="px-3 py-1 border rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage(p => p + 1)}>Suivant</button>
      </div>

      <Dialog open={detailOpen} onOpenChange={(open) => { setDetailOpen(open); if (!open) setDetailTender(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détail de l'appel d'offre</DialogTitle>
            <DialogDescription>Informations détaillées</DialogDescription>
          </DialogHeader>

          {detailLoading ? (
            <div className="py-8 text-center text-neutral-500">Chargement...</div>
          ) : detailTender ? (
            <div className="space-y-3 text-sm">
              {detailTender.productId?.productImage && (
                <div className="flex justify-center mb-4">
                  <img
                    src={getFullMediaUrl(detailTender.productId.productImage)}
                    alt={detailTender.productId.productName}
                    className="w-full max-h-48 object-cover rounded"
                  />
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <div className="font-bold text-base text-neutral-900">{detailTender.titre}</div>
                <Badge className={`shrink-0 mt-0.5 ${statusColor(detailTender.statut || '')}`}>
                  {(detailTender.statut || '').replace('_', ' ')}
                </Badge>
              </div>
              <div><b>Description :</b> {detailTender.description || '-'}</div>
              <div><b>Produit :</b> {detailTender.productId?.productName || '-'}</div>
              <div><b>Code CPC :</b> {detailTender.productId?.codeCPC || '-'}</div>
              <div><b>Quantité :</b> {detailTender.quantite} {detailTender.unite}</div>
              <div><b>Lanceur :</b> {detailTender.lanceurId?.userNickName} {detailTender.lanceurId?.userName || ''}</div>
              <div><b>Site de livraison :</b> {detailTender.siteLivraison?.siteName || '-'}</div>
              <div><b>Adresse :</b> {detailTender.siteLivraison?.siteAddress || '-'}</div>
              <div><b>Conditions de paiement :</b> {detailTender.conditionsPaiement || '-'}</div>
              <div><b>Délai de livraison :</b> {detailTender.delaiLivraisonSouhaite || '-'}</div>
              <div><b>Date limite :</b> {detailTender.dateLimite ? new Date(detailTender.dateLimite).toLocaleDateString('fr-FR') : '-'}</div>
              <div><b>Date de dépouillement :</b> {detailTender.dateDepouillement ? new Date(detailTender.dateDepouillement).toLocaleDateString('fr-FR') : '-'}</div>
              <div><b>Date de création :</b> {detailTender.createdAt ? new Date(detailTender.createdAt).toLocaleDateString('fr-FR') : '-'}</div>
              {detailTender.documentPieces && (
                <div>
                  <a href={detailTender.documentPieces} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    Voir le document
                  </a>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" status="inactive">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'annulation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler cet appel d'offre ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" status="inactive">Non</Button>
            </DialogClose>
            <Button color="destructive" status={deleteLoading ? 'loading' : 'active'} disabled={deleteLoading} onClick={handleDelete}>
              {deleteLoading ? 'Annulation...' : 'Oui, annuler'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bidsOpen} onOpenChange={(open) => { setBidsOpen(open); if (!open) setBidsTenderId(null); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Soumissions reçues</DialogTitle>
            <DialogDescription>Liste des soumissions pour cet appel d'offre</DialogDescription>
          </DialogHeader>

          {bidsLoading ? (
            <div className="py-8 text-center text-neutral-500">Chargement...</div>
          ) : bids.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">Aucune soumission pour le moment</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-neutral-500 uppercase border-b">
                    <th className="py-2 pr-2 text-left">Soumissionnaire</th>
                    <th className="py-2 px-2 text-left">Prix unitaire</th>
                    <th className="py-2 px-2 text-left">Qté</th>
                    <th className="py-2 px-2 text-left">Total</th>
                    <th className="py-2 px-2 text-left">Délai</th>
                    <th className="py-2 px-2 text-left">Statut</th>
                    <th className="py-2 pl-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((bid) => {
                    const soumissionnaire = bid.soumissionnaireId || bid.userId || {};
                    const total = bid.prixTotal ?? (bid.prixUnitaire * bid.quantite);
                    return (
                      <tr key={bid._id} className="border-b last:border-b-0 hover:bg-neutral-50">
                        <td className="py-3 pr-2 font-medium text-neutral-900">{soumissionnaire.userNickName || soumissionnaire.userName || 'Anonyme'}</td>
                        <td className="py-3 px-2">{bid.prixUnitaire != null ? `${bid.prixUnitaire.toLocaleString()} Ar` : '-'}</td>
                        <td className="py-3 px-2">{bid.quantite || '-'}</td>
                        <td className="py-3 px-2 font-medium">{total ? `${total.toLocaleString()} Ar` : '-'}</td>
                        <td className="py-3 px-2">{bid.delaiLivraison || '-'}</td>
                        <td className="py-3 px-2">
                          <Badge className={bid.statut === 'RETENUE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'}>
                            {bid.statut || 'SOUMIS'}
                          </Badge>
                        </td>
                        <td className="py-3 pl-2 text-right">
                          {bid.statut !== 'RETENUE' ? (
                            <Button
                              size="sm"
                              color="default"
                              onClick={() => setAwardTarget({ tenderId: bidsTenderId, bidId: bid._id, commentaire: '' })}
                            >
                              <CheckCircleIcon className="w-4 h-4 mr-1" /> Attribuer
                            </Button>
                          ) : (
                            <span className="text-green-700 text-xs font-semibold">RETENUE</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" status="inactive">Fermer</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={awardTarget !== null} onOpenChange={(open) => { if (!open) setAwardTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'attribution</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir attribuer cet appel d'offre à cette soumission ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="commentaire">Commentaire (optionnel)</Label>
            <Textarea
              id="commentaire"
              value={awardTarget?.commentaire || ''}
              onChange={(e) => setAwardTarget(prev => prev ? { ...prev, commentaire: e.target.value } : null)}
              placeholder="Commentaire sur l'attribution"
              rows={3}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" status="inactive">Annuler</Button>
            </DialogClose>
            <Button color="default" status={awardLoading ? 'loading' : 'active'} disabled={awardLoading} onClick={handleAward}>
              {awardLoading ? 'Attribution...' : 'Confirmer l\'attribution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateTenderModal({ onSuccess }) {
  const [form, setForm] = useState({
    documentPieces: null,
    unite: '',
    conditionsPaiement: '',
    delaiLivraisonSouhaite: '',
    productId: '',
    siteLivraison: '',
    titre: '',
    quantite: '',
    dateLimite: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState([]);
  const [sites, setSites] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productOpen, setProductOpen] = useState(false);
  const [productHighlighted, setProductHighlighted] = useState(0);
  const [siteSearch, setSiteSearch] = useState('');
  const [siteOpen, setSiteOpen] = useState(false);
  const [siteHighlighted, setSiteHighlighted] = useState(0);

  const filteredProducts = products.filter(p => (p.productName || '').toLowerCase().includes(productSearch.toLowerCase()) || (p.codeCPC || '').toLowerCase().includes(productSearch.toLowerCase()));

  const filteredSites = sites.filter(s => (s.siteName || '').toLowerCase().includes(siteSearch.toLowerCase()));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, siteRes] = await Promise.all([
          selectAllProduits(),
          getMySites({ limit: 100, page: 1 }),
        ]);
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
        setSites(Array.isArray(siteRes?.data?.data) ? siteRes.data.data : Array.isArray(siteRes?.data) ? siteRes.data : Array.isArray(siteRes) ? siteRes : []);
      } catch (err) {
        console.error('Erreur chargement produits/sites', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const payload = {
        ...form,
        quantite: Number(form.quantite),
      };
      await createTender(payload, token);
      toast.success('Appel d\'offre créé avec succès');
      onSuccess();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création de l\'appel d\'offre');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Nouvel appel d'offre</DialogTitle>
        <DialogDescription>
          Remplissez les informations ci-dessous pour créer un nouvel appel d'offre.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="titre" required>Titre</Label>
          <Input id="titre" name="titre" value={form.titre} onChange={handleChange} required placeholder="Titre de l'appel d'offre" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description" required>Description</Label>
          <Textarea id="description" name="description" value={form.description} onChange={handleChange} required placeholder="Description détaillée du besoin (incluant les TDR)" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="quantite" required>Quantité</Label>
            <Input id="quantite" name="quantite" type="number" value={form.quantite} onChange={handleChange} required min="1" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unite" required>Unité</Label>
            <Input id="unite" name="unite" value={form.unite} onChange={handleChange} required placeholder="kg" />
          </div>
        </div>

        <div className="grid gap-2">
          <Label required>Produit</Label>
          <div className="relative">
            <Input
              placeholder={products.length === 0 ? "Aucun produit disponible" : "Rechercher un produit..."}
              value={productSearch}
              onChange={e => { setProductSearch(e.target.value); setForm(prev => ({ ...prev, productId: '' })); }}
              onFocus={() => { setProductOpen(true); setProductHighlighted(0); }}
              onBlur={() => setTimeout(() => setProductOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') return setProductOpen(false);
                if (!productOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                  setProductOpen(true);
                  e.preventDefault();
                  return;
                }
                if (productOpen) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setProductHighlighted(i => Math.min(i + 1, Math.max(filteredProducts.length - 1, 0)));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setProductHighlighted(i => Math.max(i - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const product = filteredProducts[productHighlighted];
                    if (product) {
                      setForm(prev => ({ ...prev, productId: product._id }));
                      setProductSearch(product.productName);
                      setProductOpen(false);
                    }
                  }
                }
              }}
              className="w-full"
              disabled={products.length === 0}
            />
            {productOpen && filteredProducts.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                {filteredProducts.map((product, idx) => (
                  <button
                    type="button"
                    key={product._id}
                    onMouseEnter={() => setProductHighlighted(idx)}
                    onClick={() => {
                      setForm(prev => ({ ...prev, productId: product._id }));
                      setProductSearch(product.productName);
                      setProductOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${idx === productHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                  >
                    {product.productName} - {product.codeCPC}
                  </button>
                ))}
              </div>
            )}
            {productOpen && filteredProducts.length === 0 && products.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                <div className="px-3 py-2 text-sm text-neutral-500">Aucun produit trouvé</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label required>Site de livraison</Label>
          <div className="relative">
            <Input
              placeholder={sites.length === 0 ? "Aucun site disponible" : "Rechercher un site..."}
              value={siteSearch}
              onChange={e => { setSiteSearch(e.target.value); setForm(prev => ({ ...prev, siteLivraison: '' })); }}
              onFocus={() => { setSiteOpen(true); setSiteHighlighted(0); }}
              onBlur={() => setTimeout(() => setSiteOpen(false), 150)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') return setSiteOpen(false);
                if (!siteOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                  setSiteOpen(true);
                  e.preventDefault();
                  return;
                }
                if (siteOpen) {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSiteHighlighted(i => Math.min(i + 1, Math.max(filteredSites.length - 1, 0)));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSiteHighlighted(i => Math.max(i - 1, 0));
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const site = filteredSites[siteHighlighted];
                    if (site) {
                      setForm(prev => ({ ...prev, siteLivraison: site._id }));
                      setSiteSearch(site.siteName);
                      setSiteOpen(false);
                    }
                  }
                }
              }}
              className="w-full"
              disabled={sites.length === 0}
            />
            {siteOpen && filteredSites.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                {filteredSites.map((site, idx) => (
                  <button
                    type="button"
                    key={site._id}
                    onMouseEnter={() => setSiteHighlighted(idx)}
                    onClick={() => {
                      setForm(prev => ({ ...prev, siteLivraison: site._id }));
                      setSiteSearch(site.siteName);
                      setSiteOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${idx === siteHighlighted ? 'bg-violet-50' : 'hover:bg-neutral-100'}`}
                  >
                    {site.siteName} - {site.siteAddress}
                  </button>
                ))}
              </div>
            )}
            {siteOpen && filteredSites.length === 0 && sites.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow max-h-60 overflow-auto z-50">
                <div className="px-3 py-2 text-sm text-neutral-500">Aucun site trouvé</div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="conditionsPaiement" required>Conditions de paiement</Label>
          <Input id="conditionsPaiement" name="conditionsPaiement" value={form.conditionsPaiement} onChange={handleChange} required placeholder="Conditions de paiement" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="delaiLivraisonSouhaite" required>Délai de livraison souhaité</Label>
          <Input id="delaiLivraisonSouhaite" name="delaiLivraisonSouhaite" value={form.delaiLivraisonSouhaite} onChange={handleChange} required placeholder="Délai de livraison souhaité" />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="dateLimite" required>Date limite</Label>
          <Input id="dateLimite" name="dateLimite" type="datetime-local" value={form.dateLimite ? form.dateLimite.slice(0, 16) : ''} onChange={e => setForm(prev => ({ ...prev, dateLimite: e.target.value ? e.target.value + ':00Z' : '' }))} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="documentPieces">Document (pièces justificatives)</Label>
          <Input id="documentPieces" name="documentPieces" type="file" onChange={handleChange} accept="image/*,.pdf" />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" status="inactive">Annuler</Button>
          </DialogClose>
          <Button type="submit" color="default" status={submitting ? 'loading' : 'active'} disabled={submitting}>
            {submitting ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

function BidModal({ open, onOpenChange, tenderId }) {
  const [form, setForm] = useState({
    prixUnitaire: '',
    quantite: '',
    delaiLivraison: '',
    observations: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenderId) return;
    setSubmitting(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const payload = {
        appelOffreId: tenderId,
        prixUnitaire: Number(form.prixUnitaire),
        quantite: Number(form.quantite),
        delaiLivraison: form.delaiLivraison,
        observations: form.observations,
      };
      await createBid(tenderId, payload, token);
      toast.success('Soumission envoyée avec succès');
      onOpenChange(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'envoi de la soumission");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Soumettre une offre</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour soumissionner à cet appel d'offre.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="prixUnitaire" required>Prix unitaire</Label>
            <Input id="prixUnitaire" name="prixUnitaire" type="number" step="0.01" value={form.prixUnitaire} onChange={handleChange} required placeholder="Prix unitaire proposé" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantite" required>Quantité</Label>
            <Input id="quantite" name="quantite" type="number" value={form.quantite} onChange={handleChange} required min="1" placeholder="Quantité proposée" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="delaiLivraison" required>Délai de livraison</Label>
            <Input id="delaiLivraison" name="delaiLivraison" value={form.delaiLivraison} onChange={handleChange} required placeholder="Délai de livraison proposé" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="observations">Observations</Label>
            <Textarea id="observations" name="observations" value={form.observations} onChange={handleChange} placeholder="Observations / commentaires" rows={3} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" status="inactive">Annuler</Button>
            </DialogClose>
            <Button type="submit" color="default" status={submitting ? 'loading' : 'active'} disabled={submitting}>
              {submitting ? 'Envoi...' : 'Soumettre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
