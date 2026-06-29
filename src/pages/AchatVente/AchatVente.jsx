import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { createVenteTransaction } from '../../services/transaction.service';
import { getAllUsersSelect } from '../../services/user.service';
import { getMySites, getActifsBySite } from '../../services/site.service';
import { getAccessToken } from '../../services/token.service';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

const AchatVente = () => {
  usePageTitle('Achat / Vente');
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [form, setForm] = useState({
    vendeurId: '',
    productId: '',
    siteOrigineId: '',
    siteDestinationId: '',
    quantite: '',
    prixUnitaire: '',
    observations: '',
  });

  useEffect(() => {
    getAllUsersSelect().then(res => setUsers(Array.isArray(res) ? res : []));
    getMySites().then(res => {
      const sitesData = res?.data || [];
      setSites(Array.isArray(sitesData) ? sitesData : []);
    });
  }, []);

  useEffect(() => {
    if (form.siteOrigineId) {
      setLoadingProducts(true);
      getActifsBySite(form.siteOrigineId).then(res => {
        const items = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        setProducts(items);
        setForm(prev => ({ ...prev, productId: '', quantite: '', prixUnitaire: '' }));
      }).finally(() => setLoadingProducts(false));
    } else {
      setProducts([]);
    }
  }, [form.siteOrigineId]);

  const handleSelectProduct = (productId) => {
    const actif = products.find(p => (p.productId || p._id) === productId);
    setForm(prev => ({
      ...prev,
      productId,
      prixUnitaire: actif?.prixUnitaire || '',
      quantite: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vendeurId || !form.productId || !form.siteOrigineId || !form.siteDestinationId || !form.quantite) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const token = getAccessToken();
      if (!token) { toast.error('Authentification requise'); return; }
      await createVenteTransaction(form, token);
      toast.success('Transaction effectuée avec succès');
      setForm({ vendeurId: '', productId: '', siteOrigineId: '', siteDestinationId: '', quantite: '', prixUnitaire: '', observations: '' });
      setProducts([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de la transaction");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <h1 className="text-2xl text-neutral-900 mb-6">Achat / Vente</h1>
          <Card className="border-neutral-200 bg-white">
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="vendeurId">Vendeur *</Label>
                <Select value={form.vendeurId} onValueChange={v => setForm(prev => ({ ...prev, vendeurId: v }))}>
                  <SelectTrigger id="vendeurId" className="bg-white"><SelectValue placeholder="Sélectionner un vendeur" /></SelectTrigger>
                  <SelectContent>
                    {users.map(u => (
                      <SelectItem key={u._id || u.id} value={u._id || u.id}>{u.name || u.userNickName || u.userName || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="siteOrigineId">Site d'origine *</Label>
                <Select value={form.siteOrigineId} onValueChange={v => setForm(prev => ({ ...prev, siteOrigineId: v }))}>
                  <SelectTrigger id="siteOrigineId" className="bg-white"><SelectValue placeholder="Sélectionner un site" /></SelectTrigger>
                  <SelectContent>
                    {sites.map(s => (
                      <SelectItem key={s._id || s.id} value={s._id || s.id}>{s.siteName || s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="productId">Produit *</Label>
                <Select value={form.productId} onValueChange={handleSelectProduct} disabled={!form.siteOrigineId || loadingProducts}>
                  <SelectTrigger id="productId" className="bg-white"><SelectValue placeholder={!form.siteOrigineId ? "Choisissez d'abord un site" : loadingProducts ? "Chargement..." : "Sélectionner un produit"} /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.productId || p._id} value={p.productId || p._id}>{p.productName || p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="siteDestinationId">Site de destination *</Label>
                <Select value={form.siteDestinationId} onValueChange={v => setForm(prev => ({ ...prev, siteDestinationId: v }))}>
                  <SelectTrigger id="siteDestinationId" className="bg-white"><SelectValue placeholder="Sélectionner un site" /></SelectTrigger>
                  <SelectContent>
                    {sites.map(s => (
                      <SelectItem key={s._id || s.id} value={s._id || s.id}>{s.siteName || s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantite">Quantité *</Label>
                  <Input id="quantite" type="number" min="1" value={form.quantite} onChange={e => setForm(prev => ({ ...prev, quantite: e.target.value }))} className="bg-white" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prixUnitaire">Prix unitaire (Ar)</Label>
                  <Input id="prixUnitaire" type="number" min="0" value={form.prixUnitaire} onChange={e => setForm(prev => ({ ...prev, prixUnitaire: e.target.value }))} className="bg-white" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="observations">Observations</Label>
                <Textarea id="observations" value={form.observations} onChange={e => setForm(prev => ({ ...prev, observations: e.target.value }))} placeholder="Observations facultatives" rows={3} />
              </div>

              <Button type="submit" status={saving ? 'loading' : 'active'} color="default" disabled={saving} className="w-full">
                {saving ? 'Traitement...' : 'Effectuer la transaction'}
              </Button>
            </form>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AchatVente;
