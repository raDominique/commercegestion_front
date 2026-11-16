import { useState, useEffect, useRef } from 'react';
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
import { getAllUsersSelect, getUserByEmail, getUsers } from '../../services/user.service';
import { getMySites } from '../../services/site.service';
import { getQuantiteVendableBySite } from '../../services/actifs.service';
import { getAccessToken } from '../../services/token.service';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import { Loader } from '../../components/ui/loader';
import { formatThousands } from '../../utils/formatNumber';
import { getTransactionErrorMessage } from '../../utils/transactionErrors.js';
import { MemberIdLookupInput } from '../../components/commons/MemberIdLookupInput.jsx';

const getUserDisplayName = (u) => u?.name || u?.userNickName || u?.userName || u?.email || '';
const truncate = (text, max = 35) => !text || text.length <= max ? text : text.slice(0, max) + '…';

const AchatVente = () => {
  usePageTitle('Achat / Vente');
  const { user, getProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [vendeur, setVendeur] = useState(null);
  const [vendeurLoading, setVendeurLoading] = useState(true);
  const [vendeurError, setVendeurError] = useState('');
  const [contrepartieInput, setContrepartieInput] = useState('');
  const [contrepartieId, setContrepartieId] = useState('');
  const [contrepartieName, setContrepartieName] = useState('');
  const [contrepartieSearchMode, setContrepartieSearchMode] = useState('id');
  const [contrepartieLookupLoading, setContrepartieLookupLoading] = useState(false);
  const [contrepartieError, setContrepartieError] = useState('');
  const contrepartieSearchRef = useRef('');
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
    let active = true;
    const loadVendeur = async () => {
      setVendeurLoading(true);
      setVendeurError('');
      try {
        const profile = await getProfile();
        const id = profile?._id || profile?.id;
        const email = profile?.userEmail || profile?.email;
        const userId = profile?.userId || '';
        if (!id || !email) throw new Error('Profil vendeur incomplet');
        if (active) setVendeur({ id, email, userId });
      } catch (error) {
        console.error('Impossible de charger le profil vendeur:', error);
        if (active) {
          setVendeur(null);
          setVendeurError('Les informations du vendeur connecté sont indisponibles. Veuillez réessayer plus tard.');
        }
      } finally {
        if (active) setVendeurLoading(false);
      }
    };

    if (user) loadVendeur();
    else {
      setVendeur(null);
      setVendeurLoading(false);
    }
    return () => { active = false; };
  }, [getProfile, user]);

  useEffect(() => {
    if (siteOrigineId) {
      setLoadingProducts(true);
      getQuantiteVendableBySite(siteOrigineId).then(res => {
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

  /* Legacy seller lookup UI retained below for reference while this form uses the authenticated seller.
  const resetForm = () => {
    setVendeurInput('');
    setVendeurId('');
    setVendeurName('');
    setVendeurNotFound(false);
    setResolvedVendeur(null);
    vendeurSearchRef.current = '';
    setContrepartieInput('');
    setContrepartieId('');
    setSiteOrigineId('');
    setProductId('');
    setQuantite('');
    setRapportEchange('');
    setObservations('');
    setProducts([]);
  };

  const resolveVendeurByCode = async (code) => {
    setVendeurLookupLoading(true);
    try {
      const res = await getUsers({ search: code, limit: 10 });
      const members = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      const member = members.find((item) => item && item.userId === code) || members[0] || null;
      if (vendeurSearchRef.current !== code) return;
      if (!member || !member.userId) {
        setVendeurId('');
        setResolvedVendeur(null);
        setVendeurName('');
        setVendeurNotFound(true);
        return;
      }
      setVendeurId(member._id || member.id || '');
      setResolvedVendeur(member);
      setVendeurName(getUserDisplayName(member));
    } catch (err) {
      console.error('Erreur lors de la recherche du vendeur:', err);
      if (vendeurSearchRef.current === code) {
        setVendeurId('');
        setResolvedVendeur(null);
        setVendeurName('');
        setVendeurNotFound(true);
      }
    } finally {
      setVendeurLookupLoading(false);
    }
  };

  const resolveVendeurByEmail = async (email) => {
    setVendeurLookupLoading(true);
    try {
      const member = await getUserByEmail(email);
      if (vendeurSearchRef.current !== email) return;
      if (!member?.userId) {
        setVendeurId('');
        setResolvedVendeur(null);
        setVendeurName('');
        setVendeurNotFound(true);
        return;
      }
      setVendeurId(member._id || member.id || '');
      setResolvedVendeur(member);
      setVendeurName(getUserDisplayName(member));
    } catch (err) {
      console.error('Erreur lors de la recherche du vendeur par e-mail:', err);
      if (vendeurSearchRef.current === email) {
        setVendeurId('');
        setResolvedVendeur(null);
        setVendeurName('');
        setVendeurNotFound(true);
      }
    } finally {
      setVendeurLookupLoading(false);
    }
  };

  const handleVendeurEmailSearch = (email) => {
    const search = email.trim().toLowerCase();
    vendeurSearchRef.current = search;
    setVendeurNotFound(false);
    setVendeurId('');
    setVendeurName('');
    setResolvedVendeur(null);
    resolveVendeurByEmail(search);
  };

  const handleVendeurCodeChange = (event) => {
    const rawValue = event.target.value;
    const value = rawValue.includes('@') ? rawValue : rawValue.toUpperCase();
    const code = value.trim();
    vendeurSearchRef.current = code.includes('@') ? code.toLowerCase() : code;
    setVendeurInput(value);
    setVendeurId('');
    setVendeurName('');
    setResolvedVendeur(null);
    setVendeurNotFound(false);
  };

  const handleVendeurIdSearch = (value) => {
    const code = String(value || '').trim().toUpperCase();
    if (code.length !== 8) return;
    vendeurSearchRef.current = code;
    setVendeurInput(code);
    setVendeurId('');
    setVendeurName('');
    setResolvedVendeur(null);
    setVendeurNotFound(false);
    const member = users.find((item) => item?.userId === code);
    if (member) {
      setVendeurId(member._id || member.id || '');
      setResolvedVendeur(member);
      setVendeurName(getUserDisplayName(member));
      return;
    }
    resolveVendeurByCode(code);
  };

  const vendeurField = (
    <div className="space-y-2">
      <div className="space-y-2">
        <MemberIdLookupInput
          placeholder="ID du vendeur (8 caractères) ou e-mail"
          value={vendeurInput}
          emailLookupLoading={vendeurLookupLoading}
          searchMode={vendeurSearchMode}
          onSearchModeChange={setVendeurSearchMode}
          onSearch={(value, mode) => {
            if (mode === 'email') {
              handleVendeurEmailSearch(value);
              return;
            }
            handleVendeurIdSearch(value);
          }}
          onChange={handleVendeurCodeChange}
          className={`bg-white ${vendeurNotFound ? 'border-red-400' : ''}`}
        />
        <div className="relative">
          <Input
            placeholder={vendeurNotFound ? 'Membre non trouvé' : 'Nom du vendeur'}
            value={vendeurName}
            readOnly
            disabled={vendeurLookupLoading}
            className={`bg-neutral-100 text-neutral-700 pr-9 ${vendeurNotFound ? 'border-red-400 text-red-600' : 'border-neutral-300'}`}
          />
          {vendeurLookupLoading && (
            <Loader size="sm" className="absolute right-2.5 top-1/2 -translate-y-1/2 border-neutral-400 border-t-transparent shrink-0" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        {vendeurLookupLoading ? (
          <span className="text-neutral-400" />
        ) : resolvedVendeur ? (
          <span className="text-emerald-600">Membre valide</span>
        ) : vendeurNotFound ? (
          <span className="text-red-600">Membre invalide</span>
        ) : (vendeurInput && !vendeurInput.includes('@') && vendeurInput.length !== 8) ? (
          <span className="text-amber-600">L'ID doit contenir exactement 8 caractères</span>
        ) : (
          <span className="text-neutral-500" />
        )}
        <span className="text-neutral-400">{vendeurInput.includes('@') ? '' : `${vendeurInput.length}/8`}</span>
      </div>
      {vendeurNotFound && (
        <p className="text-xs text-red-600">Aucun membre trouvé avec cet ID ou cette adresse e-mail.</p>
      )}
    </div>
  );

  */
  const vendeurId = vendeur?.id || '';
  const vendeurIdentifiers = new Set(
    [vendeur?.id, vendeur?.userId, vendeur?.email]
      .filter(Boolean)
      .map((identifier) => String(identifier).toLowerCase())
  );

  const applyContrepartie = (member) => {
    if (!member) {
      setContrepartieId('');
      setContrepartieName('');
      setContrepartieError('Aucun membre trouvé avec cet ID ou cette adresse e-mail.');
      return;
    }

    const identifiers = [member?._id, member?.id, member?.userId, member?.userEmail, member?.email]
      .filter(Boolean)
      .map((identifier) => String(identifier).toLowerCase());

    if (identifiers.some((identifier) => vendeurIdentifiers.has(identifier))) {
      setContrepartieId('');
      setContrepartieName('');
      setContrepartieError('Le vendeur connecté ne peut pas être la contrepartie.');
      return;
    }

    setContrepartieId(member._id || member.id || member.userId || '');
    setContrepartieName(getUserDisplayName(member));
    setContrepartieError('');
  };

  const resolveContrepartieByCode = async (code) => {
    setContrepartieLookupLoading(true);
    try {
      const res = await getUsers({ search: code, limit: 10 });
      const members = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      const member = members.find((item) => item && String(item.userId || '').toUpperCase() === code) || members[0] || null;
      if (contrepartieSearchRef.current !== code) return;
      applyContrepartie(member);
    } catch (err) {
      console.error('Erreur lors de la recherche de la contrepartie:', err);
      if (contrepartieSearchRef.current === code) applyContrepartie(null);
    } finally {
      setContrepartieLookupLoading(false);
    }
  };

  const resolveContrepartieByEmail = async (email) => {
    setContrepartieLookupLoading(true);
    try {
      const member = await getUserByEmail(email);
      if (contrepartieSearchRef.current !== email) return;
      applyContrepartie(member);
    } catch (err) {
      console.error('Erreur lors de la recherche de la contrepartie par e-mail:', err);
      if (contrepartieSearchRef.current === email) applyContrepartie(null);
    } finally {
      setContrepartieLookupLoading(false);
    }
  };

  const handleContrepartieModeChange = (mode) => {
    setContrepartieSearchMode(mode);
    setContrepartieInput('');
    setContrepartieId('');
    setContrepartieName('');
    setContrepartieError('');
    contrepartieSearchRef.current = '';
  };

  const handleContrepartieChange = (event) => {
    const rawValue = event.target.value;
    setContrepartieInput(contrepartieSearchMode === 'id' ? rawValue.toUpperCase() : rawValue);
    setContrepartieId('');
    setContrepartieName('');
    setContrepartieError('');
    contrepartieSearchRef.current = '';
  };

  const handleContrepartieSearch = (value, mode) => {
    if (mode === 'email') {
      const email = String(value || '').trim().toLowerCase();
      contrepartieSearchRef.current = email;
      setContrepartieInput(email);
      setContrepartieId('');
      setContrepartieName('');
      setContrepartieError('');
      resolveContrepartieByEmail(email);
      return;
    }

    const code = String(value || '').trim().toUpperCase();
    if (code.length !== 8) return;
    contrepartieSearchRef.current = code;
    setContrepartieInput(code);
    setContrepartieId('');
    setContrepartieName('');
    setContrepartieError('');

    const member = users.find((item) => String(item?.userId || '').toUpperCase() === code);
    if (member) {
      applyContrepartie(member);
      return;
    }
    resolveContrepartieByCode(code);
  };

  const resetForm = () => {
    setContrepartieInput('');
    setContrepartieId('');
    setContrepartieName('');
    setContrepartieSearchMode('id');
    setContrepartieError('');
    contrepartieSearchRef.current = '';
    setSiteOrigineId('');
    setProductId('');
    setQuantite('');
    setRapportEchange('');
    setObservations('');
    setProducts([]);
  };

  const ready = {
    vendeur: !!vendeurId,
    contrepartie: !!contrepartieId,
    siteOrigine: !!siteOrigineId,
    product: !!productId,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = [];
    if (!vendeurId) missing.push('Vendeur');
    if (!contrepartieId) missing.push('Contrepartie');
    if (!siteOrigineId) missing.push('Site d\'origine');
    if (!productId) missing.push('Produit');
    if (!quantite) missing.push('Quantité');
    if (!rapportEchange) missing.push('Rapport d\'échange');
    if (missing.length > 0) { toast.error(`Champs obligatoires : ${missing.join(', ')}`); return; }
    if (!Number.isFinite(Number(quantite)) || Number(quantite) <= 0) { toast.error('Veuillez saisir une quantité supérieure à 0'); return; }
    const rawProductId = selectedProduct?.productId ?? selectedProduct?._id;
    const actualProductId = typeof rawProductId === 'string' ? rawProductId : (rawProductId?._id || rawProductId?.id);
    if (!actualProductId && productId) { toast.error('Erreur de sélection du produit'); return; }
    setSaving(true);
    try {
      const token = getAccessToken();
      if (!token) { toast.error('Authentification requise'); return; }
      const response = await createVenteTransaction({
        vendeurId,
        productId: actualProductId,
        siteOrigineId,
        siteDestinationId: siteOrigineId,
        quantite: Number(quantite),
        contrepartieId,
        rapportEchange: Number(rapportEchange),
        observations,
      }, token);
      toast.success(response?.data?.message || 'Échange envoyé et en attente d’approbation.');
      resetForm();
    } catch (err) {
      toast.error(getTransactionErrorMessage(err, "Erreur lors de l'échange"));
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
          <Tabs value="exchange">
            <TabsList>
              <TabsTrigger value="exchange">Échange produit</TabsTrigger>
            </TabsList>
            <TabsContent value="exchange">
              <Card className="border-neutral-200 bg-white">
                <div className="px-4 pt-4">
                  <h2 className="text-lg font-semibold text-neutral-900">Échange produit</h2>
                  <p className="text-sm text-neutral-600">Échangez un produit avec un autre membre.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 p-4">
                  <div className="space-y-2">
                    <Label required>1. Vendeur</Label>
                    <Input
                      value={vendeurLoading ? 'Chargement…' : vendeur?.email || ''}
                      placeholder="E-mail du vendeur connecté"
                      readOnly
                      disabled
                      className="border-neutral-300 bg-neutral-100 text-neutral-700"
                    />
                    {vendeurError ? (
                      <p className="text-xs text-red-600">{vendeurError}</p>
                    ) : (
                      <p className="text-xs text-neutral-500">Le vendeur est automatiquement le membre connecté.</p>
                    )}
                  </div>

                  {ready.vendeur && (
                    <div className="space-y-2">
                      <Label required>2. Contrepartie (acheteur)</Label>
                      <MemberIdLookupInput
                        value={contrepartieInput}
                        onChange={handleContrepartieChange}
                        onSearch={handleContrepartieSearch}
                        searchMode={contrepartieSearchMode}
                        onSearchModeChange={handleContrepartieModeChange}
                        emailLookupLoading={contrepartieLookupLoading}
                        placeholder="ID membre (8 caractères) ou e-mail"
                        className={`bg-white ${contrepartieError ? 'border-red-400' : ''}`}
                      />
                      {contrepartieError ? (
                        <p className="text-xs text-red-600">{contrepartieError}</p>
                      ) : contrepartieName ? (
                        <p className="text-xs text-emerald-600">Membre valide : {contrepartieName}</p>
                      ) : (
                        <p className="text-xs text-neutral-500">Recherchez l'acheteur par son ID membre ou son adresse e-mail.</p>
                      )}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label required>5. Quantité{maxQty != null ? ` (Stock: ${formatThousands(maxQty)})` : ''}</Label>
                          <Input type="number" min="0" step="any" max={maxQty ?? undefined} value={quantite} onChange={e => {
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

                      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                        <Button variant="outline" type="button" onClick={resetForm} className="w-full sm:w-auto">Annuler</Button>
                        <Button variant="default" status={saving ? 'loading' : 'active'} color="default" type="submit" disabled={saving} className="w-full sm:w-auto">
                          {saving && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                          {saving ? 'Traitement...' : 'Effectuer la vente'}
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
