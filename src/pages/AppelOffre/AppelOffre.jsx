import React from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { useEffect, useState, useCallback } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
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
import { getTenders, getMyTenders, createTender } from '../../services/appeloffre.service';
import { getAccessToken } from '../../services/token.service';
import { getProducts } from '../../services/product.service';
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

function TendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = getAccessToken() || localStorage.getItem('token');
        const params = { page, limit, search, sortBy: sort, order };
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
  }, [page, limit]);

  if (loading) return <div className="p-6">Chargement des appels d'offre...</div>;
  if (!tenders || tenders.length === 0) return <div className="text-center text-neutral-400 py-12">Aucun appel d'offre trouvé</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Rechercher par titre"
            className="w-full p-2 border rounded bg-white"
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
          />
        </div>

        <div className="w-full md:w-48">
          <select value={sort} onChange={e => { setPage(1); setSort(e.target.value); }} className="w-full p-2 border rounded bg-white">
            <option value="createdAt">Date de création</option>
            <option value="title">Titre</option>
          </select>
        </div>

        <div className="w-full md:w-40">
          <select value={order} onChange={e => { setPage(1); setOrder(e.target.value); }} className="w-full p-2 border rounded bg-white">
            <option value="desc">Descendant</option>
            <option value="asc">Ascendant</option>
          </select>
        </div>

        <div className="w-full md:w-24">
          <select value={String(limit)} onChange={e => { setPage(1); setLimit(Number(e.target.value)); }} className="w-full p-2 border rounded bg-white">
            {[10, 20, 50].map(n => (<option key={n} value={String(n)}>{n} / page</option>))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tenders.map(item => (
          <Card key={item._id || item.id} className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="font-semibold text-neutral-900 truncate mb-2">{item.title || item.name || item._id}</div>
              <div className="text-sm text-neutral-700 mb-2">{item.description ? (item.description.length > 120 ? item.description.slice(0, 120) + '...' : item.description) : '-'}</div>
              <div className="text-xs text-neutral-500 mb-3">Statut: {item.statut || item.status || '-'}</div>
              <div className="flex justify-end">
                <Button variant="outline" size="sm">Voir</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        {/* simple pagination controls */}
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={() => setPage(p => Math.max(1, p - 1))}>Précédent</button>
          <div className="text-sm text-neutral-600">Page {page}</div>
          <button className="px-3 py-1 border rounded" onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
      </div>
    </div>
  );
}


function MyTendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTenders = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken() || localStorage.getItem('token');
      const res = await getMyTenders({ page, limit }, token);
      const items = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []));
      setTenders(items || []);
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
              </tr>
            </thead>
            <tbody>
              {tenders.map((t) => (
                <tr key={t._id || t.id} className="border-t">
                  <td className="py-3">{t.title || t.name || t._id}</td>
                  <td className="py-3">{t.statut || t.status || '-'}</td>
                  <td className="py-3">{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getAccessToken() || localStorage.getItem('token');
        const [prodRes, siteRes] = await Promise.all([
          getProducts({ limit: 200 }, token),
          getMySites({ limit: 200 }),
        ]);
        setProducts(Array.isArray(prodRes?.data) ? prodRes.data : Array.isArray(prodRes) ? prodRes : []);
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
          <Label htmlFor="productId" required>Produit</Label>
          <select id="productId" name="productId" value={form.productId} onChange={handleChange} required className="w-full p-2 border rounded bg-white h-9">
            <option value="">Sélectionner un produit</option>
            {products.map(p => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name || p.title || p._id}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="siteLivraison" required>Site de livraison</Label>
          <select id="siteLivraison" name="siteLivraison" value={form.siteLivraison} onChange={handleChange} required className="w-full p-2 border rounded bg-white h-9">
            <option value="">Sélectionner un site</option>
            {sites.map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.siteName || s.name || s._id}</option>
            ))}
          </select>
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
