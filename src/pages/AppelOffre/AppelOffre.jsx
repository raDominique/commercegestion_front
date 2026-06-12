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
import { getTenders, getMyTenders, createTender } from '../../services/appeloffre.service';
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
  }, [page, limit, statut]);

  if (loading) return <div className="p-6">Chargement des appels d'offre...</div>;
  if (!tenders || tenders.length === 0) return <div className="text-center text-neutral-400 py-12">Aucun appel d'offre trouvé</div>;

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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tenders.map(item => {
          const product = item.productId || {};
          return (
            <Card key={item._id} className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
              <CardHeader className="p-0">
                <div className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold text-neutral-900 truncate">{item.titre}</CardTitle>
                    <Badge className={`shrink-0 mt-0.5 ${statusColor(item.statut)}`}>
                      {item.statut.replace('_', ' ')}
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
                <div className="mt-3">
                  <Button className="w-full" status="active" color="default">Voir</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
                <tr key={t._id} className="border-t">
                  <td className="py-3">{t.titre || t._id}</td>
                  <td className="py-3">
                    <Badge className={statusColor(t.statut)}>{t.statut.replace('_', ' ')}</Badge>
                  </td>
                  <td className="py-3">{t.createdAt ? new Date(t.createdAt).toLocaleString('fr-FR') : '-'}</td>
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
