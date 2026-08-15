import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { createVenteTransaction } from '../../services/transaction.service';
import { getAllUsersSelect } from '../../services/user.service';
import { getMySites, getActifsBySite } from '../../services/site.service';
import { getAccessToken } from '../../services/token.service';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { UserAutocomplete } from '../../components/commons/UserAutocomplete';
import { Loader } from '../../components/ui/loader';
import { formatThousands } from '../../utils/formatNumber';

const getUserDisplayName = (u) => u?.name || u?.userNickName || u?.userName || u?.email || '';
const truncate = (text, max = 35) => !text || text.length <= max ? text : text.slice(0, max) + '…';

const AchatVente = () => {
  usePageTitle('Achat / Vente');
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [mode, setMode] = useState('monetary');

  const [vendeurInput, setVendeurInput] = useState('');
  const [vendeurId, setVendeurId] = useState('');
  const [contrepartieInput, setContrepartieInput] = useState('');
  const [contrepartieId, setContrepartieId] = useState('');
  const [siteOrigineId, setSiteOrigineId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantite, setQuantite] = useState('');
  const [rapportEchange, setRapportEchange] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    getAllUsersSelect().then(res => setUsers(Array.isArray(res) ? res : []));
    getMySites().then(res => {
      const sitesData = res?.data || [];
      setSites(Array.isArray(sitesData) ? sitesData : []);
    });
  }, []);

  useEffect(() => {
    if (siteOrigineId) {
      setLoadingProducts(true);
      getActifsBySite(siteOrigineId).then(res => {
        const items = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
        setProducts(items);
        setProductId('');
        setQuantite('');
        setRapportEchange('');
      }).finally(() => setLoadingProducts(false));
    } else {
      setProducts([]);
    }
  }, [siteOrigineId]);

  const resetForm = () => {
    setVendeurInput('');
    setVendeurId('');
    setContrepartieInput('');
    setContrepartieId('');
    setSiteOrigineId('');
    setProductId('');
    setQuantite('');
    setRapportEchange('');
    setObservations('');
    setProducts([]);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const ready = {
    vendeur: !!vendeurId,
    contrepartie: mode !== 'exchange' || !!contrepartieId,
    siteOrigine: !!siteOrigineId,
    product: !!productId,
    submit: !!vendeurId && !!siteOrigineId && !!productId && !!quantite && !!rapportEchange && (mode !== 'exchange' || !!contrepartieId),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = [];
    if (!vendeurId) missing.push('Vendeur');
    if (mode === 'exchange' && !contrepartieId) missing.push('Contrepartie');
    if (!siteOrigineId) missing.push('Site d\'origine');
    if (!productId) missing.push('Produit');
    if (!quantite) missing.push('Quantité');
    if (!rapportEchange) missing.push(mode === 'monetary' ? 'Prix unitaire' : 'Rapport d\'échange');
    if (missing.length > 0) { toast.error(`Champs obligatoires : ${missing.join(', ')}`); return; }
    const actualProductId = selectedProduct?.productId || selectedProduct?._id;
    if (!actualProductId && productId) { toast.error('Erreur de sélection du produit'); return; }
    setSaving(true);
    try {
      const token = getAccessToken();
      if (!token) { toast.error('Authentification requise'); return; }
      await createVenteTransaction({
        vendeurId,
        productId: actualProductId,
        siteOrigineId,
        siteDestinationId: siteOrigineId,
        quantite: Number(quantite),
        contrepartieId: mode === 'exchange' ? contrepartieId : null,
        rapportEchange: Number(rapportEchange),
        observations,
      }, token);
      toast.success('Transaction effectuée avec succès');
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de la transaction");
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products[Number(productId)] || null;
  const displayProductName = selectedProduct ? truncate(selectedProduct.productName || selectedProduct.name) : null;
  const maxQty = selectedProduct?.quantite ?? null;

  return (
    <div className="px-4 md:px-6 mx-auto">
      {user && user.userValidated === false ? (
        <UserNotValidatedBanner />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Achat / Vente</h1>
              <p className="text-sm text-neutral-600">Achat et vente de produits entre membres</p>
            </div>
          </div>
          <Tabs value={mode} onValueChange={handleModeChange}>
            <TabsList>
              <TabsTrigger value="monetary">Vente monétaire</TabsTrigger>
              <TabsTrigger value="exchange">Échange produit</TabsTrigger>
            </TabsList>
            <TabsContent value="monetary">
              <Card className="border-neutral-200 bg-white">
                <div className="px-4 pt-4">
                  <h2 className="text-lg font-semibold text-neutral-900">Vente monétaire</h2>
                  <p className="text-sm text-neutral-600">Vendez un produit contre de l'argent.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label required>1. Vendeur</Label>
                      <UserAutocomplete
                        users={users}
                        value={vendeurInput}
                        onChange={(val) => { setVendeurInput(val); if (!val) setVendeurId(''); }}
                        onSelect={(u) => setVendeurId(u._id || u.id)}
                        getDisplayName={getUserDisplayName}
                        placeholder="Rechercher un vendeur..."
                      />
                    </div>

                    {ready.vendeur && (
                      <div className="space-y-2">
                        <Label required>2. Site d'origine</Label>
                        <Select value={siteOrigineId} onValueChange={setSiteOrigineId}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Sélectionner un site" /></SelectTrigger>
                          <SelectContent>
                            {sites.map(s => (
                              <SelectItem key={s._id || s.id} value={s._id || s.id}>{s.siteName || s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {ready.siteOrigine && (
                      <div className="space-y-2">
                        <Label required>3. Produit</Label>
                        <Select value={productId} onValueChange={setProductId} disabled={loadingProducts}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder={loadingProducts ? "Chargement..." : "Sélectionner un produit"}>{displayProductName}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p, i) => (
                              <SelectItem key={i} value={String(i)}>{p.productName || p.name} (Stock: {formatThousands(p.quantite ?? 0)})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {ready.product && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label required>5. Quantité{maxQty != null ? ` (Stock: ${formatThousands(maxQty)})` : ''}</Label>
                            <Input type="number" min="1" max={maxQty ?? undefined} value={quantite} onChange={e => {
                              const val = e.target.value;
                              if (val === '' || Number(val) <= (maxQty ?? Infinity)) setQuantite(val);
                            }} className="bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label required>Prix unitaire (Ar)</Label>
                            <Input type="number" min="0" value={rapportEchange} onChange={e => setRapportEchange(e.target.value)} className="bg-white" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>5. Observations</Label>
                          <Textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observations facultatives" rows={3} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" type="button" onClick={resetForm}>Annuler</Button>
                          <Button variant="default" status={saving ? 'loading' : 'active'} color="default" type="submit" disabled={saving}>
                            {saving && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                            {saving ? 'Traitement...' : 'Effectuer la transaction'}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </Card>
              </TabsContent>

                <TabsContent value="exchange">
                  <Card className="border-neutral-200 bg-white">
                    <div className="px-4 pt-4">
                      <h2 className="text-lg font-semibold text-neutral-900">Échange produit</h2>
                      <p className="text-sm text-neutral-600">Échangez un produit avec un autre membre.</p>
                    </div>
                  <form onSubmit={handleSubmit} className="space-y-4 p-4">
                    <div className="space-y-2">
                      <Label required>1. Vendeur</Label>
                      <UserAutocomplete
                        users={users}
                        value={vendeurInput}
                        onChange={(val) => { setVendeurInput(val); if (!val) setVendeurId(''); }}
                        onSelect={(u) => setVendeurId(u._id || u.id)}
                        getDisplayName={getUserDisplayName}
                        placeholder="Rechercher un vendeur..."
                      />
                    </div>

                    {ready.vendeur && (
                      <div className="space-y-2">
                        <Label required>2. Contrepartie (acheteur)</Label>
                        <UserAutocomplete
                          users={users}
                          value={contrepartieInput}
                          onChange={(val) => { setContrepartieInput(val); if (!val) setContrepartieId(''); }}
                          onSelect={(u) => setContrepartieId(u._id || u.id)}
                          getDisplayName={getUserDisplayName}
                          placeholder="Rechercher la contrepartie..."
                        />
                      </div>
                    )}

                    {ready.contrepartie && (
                      <div className="space-y-2">
                        <Label required>3. Site d'origine</Label>
                        <Select value={siteOrigineId} onValueChange={setSiteOrigineId}>
                          <SelectTrigger className="bg-white"><SelectValue placeholder="Sélectionner un site" /></SelectTrigger>
                          <SelectContent>
                            {sites.map(s => (
                              <SelectItem key={s._id || s.id} value={s._id || s.id}>{s.siteName || s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {ready.siteOrigine && (
                      <div className="space-y-2">
                        <Label required>4. Produit</Label>
                        <Select value={productId} onValueChange={setProductId} disabled={loadingProducts}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder={loadingProducts ? "Chargement..." : "Sélectionner un produit"}>{displayProductName}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p, i) => (
                              <SelectItem key={i} value={String(i)}>{p.productName || p.name} (Stock: {formatThousands(p.quantite ?? 0)})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {ready.product && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label required>5. Quantité{maxQty != null ? ` (Stock: ${formatThousands(maxQty)})` : ''}</Label>
                            <Input type="number" min="1" max={maxQty ?? undefined} value={quantite} onChange={e => {
                              const val = e.target.value;
                              if (val === '' || Number(val) <= (maxQty ?? Infinity)) setQuantite(val);
                            }} className="bg-white" />
                          </div>
                          <div className="space-y-2">
                            <Label required>Rapport d'échange</Label>
                            <Input type="number" min="0" value={rapportEchange} onChange={e => setRapportEchange(e.target.value)} className="bg-white" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>6. Observations</Label>
                          <Textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observations facultatives" rows={3} />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" type="button" onClick={resetForm}>Annuler</Button>
                          <Button variant="default" status={saving ? 'loading' : 'active'} color="default" type="submit" disabled={saving}>
                            {saving && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                            {saving ? 'Traitement...' : 'Effectuer la transaction'}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                  </Card>
                </TabsContent>
              </Tabs>
        </>
      )}
    </div>
  );
};

export default AchatVente;
