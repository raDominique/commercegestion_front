import { useEffect, useMemo, useState } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { getAllUsersSelect } from '../../services/user.service';
import { getSitesByUser, getActifsBySite } from '../../services/site.service';
import { selectAllProduits } from '../../services/product.service';
import { createExchangeOffer, getExchangeOffers, buyExchangeOffer } from '../../services/exchange.service';
import { getAccessToken } from '../../services/token.service';
import { formatThousands } from '../../utils/formatNumber.js';

const initialOfferForm = {
  detenteurAId: '',
  depotAId: '',
  productAId: '',
  quantiteA: '',
  productBId: '',
  tauxEchange: '',
  acceptedDetenteurBIds: [],
};

const initialFilters = {
  productAId: 'all',
  productBId: 'all',
  detentaireAId: 'all',
  acceptedDetenteurBId: 'all',
  minTaux: '',
  maxTaux: '',
};

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.data?.data)) return value.data.data;
  return [];
};

const getId = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id || value.id || '';
};

const productLabel = (value) => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  return value.productName || value.name || value.label || value.codeCPC || value._id || '-';
};

const userLabel = (value) => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  const name = value.name || value.userNickName || value.userName || value.email || value._id || '-';
  const memberNumber = value.numeroMembre || value.memberNumber;
  return memberNumber ? `${name} - ${memberNumber}` : name;
};

const siteLabel = (value) => {
  if (!value) return '-';
  if (typeof value === 'string') return value;
  return value.siteName || value.name || value.siteAddress || value._id || '-';
};

const EchangeActifs = () => {
  usePageTitle("Echange d'actifs entre deux membres");
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [detenteurSites, setDetenteurSites] = useState([]);
  const [siteActifs, setSiteActifs] = useState([]);

  const [offerForm, setOfferForm] = useState(initialOfferForm);
  const [creating, setCreating] = useState(false);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingActifs, setLoadingActifs] = useState(false);

  const [filters, setFilters] = useState(initialFilters);
  const [offers, setOffers] = useState([]);
  const [offersTotal, setOffersTotal] = useState(0);
  const [offersPage, setOffersPage] = useState(1);
  const [offersLimit, setOffersLimit] = useState(20);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState('');
  const [buying, setBuying] = useState(false);

  const productOptions = useMemo(() => products.map((product) => ({
    id: getId(product),
    label: productLabel(product),
  })).filter((product) => product.id), [products]);

  const actifOptions = useMemo(() => siteActifs.map((actif) => {
    const product = actif.productId || actif.produit || actif.product || {};
    const id = getId(product) || actif.productId || actif.id || actif._id;
    return {
      id,
      label: actif.productName || productLabel(product),
      quantite: actif.quantite,
    };
  }).filter((actif) => actif.id), [siteActifs]);

  const selectedProductA = actifOptions.find((actif) => actif.id === offerForm.productAId);

  const loadLookups = async () => {
    try {
      setLoadingLookups(true);
      const [usersRes, productsRes] = await Promise.all([
        getAllUsersSelect(),
        selectAllProduits({ limit: 500 }),
      ]);
      setUsers(asArray(usersRes));
      setProducts(asArray(productsRes));
    } catch (err) {
      console.error('Erreur chargement référentiels échange:', err);
      toast.error('Erreur lors du chargement des référentiels');
    } finally {
      setLoadingLookups(false);
    }
  };

  const loadDetenteurSites = async (detenteurId) => {
    if (!detenteurId) {
      setDetenteurSites([]);
      setSiteActifs([]);
      return;
    }
    try {
      setLoadingSites(true);
      const res = await getSitesByUser(detenteurId);
      setDetenteurSites(asArray(res));
      setSiteActifs([]);
    } catch (err) {
      console.error('Erreur chargement sites détenteur:', err);
      setDetenteurSites([]);
      toast.error('Erreur lors du chargement des dépôts');
    } finally {
      setLoadingSites(false);
    }
  };

  const loadSiteActifs = async (siteId) => {
    if (!siteId) {
      setSiteActifs([]);
      return;
    }
    try {
      setLoadingActifs(true);
      const res = await getActifsBySite(siteId);
      setSiteActifs(asArray(res));
    } catch (err) {
      console.error('Erreur chargement actifs dépôt:', err);
      setSiteActifs([]);
      toast.error('Erreur lors du chargement des produits du dépôt');
    } finally {
      setLoadingActifs(false);
    }
  };

  const buildOfferParams = (pageOverride = offersPage) => ({
    page: pageOverride,
    limit: offersLimit,
    ...(filters.productAId !== 'all' ? { productAId: filters.productAId } : {}),
    ...(filters.productBId !== 'all' ? { productBId: filters.productBId } : {}),
    ...(filters.detentaireAId !== 'all' ? { detentaireAId: filters.detentaireAId } : {}),
    ...(filters.acceptedDetenteurBId !== 'all' ? { acceptedDetenteurBId: filters.acceptedDetenteurBId } : {}),
    ...(filters.minTaux !== '' ? { minTaux: filters.minTaux } : {}),
    ...(filters.maxTaux !== '' ? { maxTaux: filters.maxTaux } : {}),
  });

  const loadOffers = async (pageOverride) => {
    try {
      setLoadingOffers(true);
      const token = getAccessToken();
      const res = await getExchangeOffers(buildOfferParams(pageOverride), token);
      setOffers(asArray(res));
      setOffersTotal(res?.total ?? res?.data?.total ?? asArray(res).length);
    } catch (err) {
      console.error('Erreur chargement offres échange:', err);
      setOffers([]);
      setOffersTotal(0);
      toast.error('Erreur lors du chargement des offres');
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    loadOffers();
  }, [offersPage, offersLimit]);

  const handleSubmitOffer = async (event) => {
    event.preventDefault();
    if (!offerForm.detenteurAId || !offerForm.depotAId || !offerForm.productAId || !offerForm.quantiteA || !offerForm.productBId || !offerForm.tauxEchange) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setCreating(true);
      const token = getAccessToken();
      if (!token) {
        toast.error('Authentification requise');
        return;
      }

      await createExchangeOffer({
        productAId: offerForm.productAId,
        quantiteA: Number(offerForm.quantiteA),
        detentaireAId: offerForm.detenteurAId,
        depotAId: offerForm.depotAId,
        productBId: offerForm.productBId,
        tauxEchange: Number(offerForm.tauxEchange),
        acceptedDetenteurBIds: offerForm.acceptedDetenteurBIds,
      }, token);

      toast.success("Offre d'échange créée");
      setOfferForm(initialOfferForm);
      setDetenteurSites([]);
      setSiteActifs([]);
      setOffersPage(1);
      await loadOffers();
    } catch (err) {
      console.error("Erreur création offre d'échange:", err);
      toast.error(err?.response?.data?.message || "Erreur lors de la création de l'offre");
    } finally {
      setCreating(false);
    }
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    setOffersPage(1);
    loadOffers(1);
  };

  const handleBuyOffer = async () => {
    if (!selectedOffer || !buyQuantity) {
      toast.error('Veuillez saisir la quantité à acheter');
      return;
    }

    try {
      setBuying(true);
      const token = getAccessToken();
      if (!token) {
        toast.error('Authentification requise');
        return;
      }

      await buyExchangeOffer(getId(selectedOffer), Number(buyQuantity), token);
      toast.success('Achat effectué avec succès');
      setBuyDialogOpen(false);
      setSelectedOffer(null);
      setBuyQuantity('');
      await loadOffers();
    } catch (err) {
      console.error("Erreur achat offre d'échange:", err);
      toast.error(err?.response?.data?.message || "Erreur lors de l'achat de l'offre");
    } finally {
      setBuying(false);
    }
  };

  const toggleAcceptedDetenteur = (id, checked) => {
    setOfferForm((prev) => ({
      ...prev,
      acceptedDetenteurBIds: checked
        ? [...prev.acceptedDetenteurBIds, id]
        : prev.acceptedDetenteurBIds.filter((detenteurId) => detenteurId !== id),
    }));
  };

  const renderAcceptedDetenteurs = (offer) => {
    const accepted = offer.acceptedDetenteurBIds || offer.acceptedDetenteursB || offer.acceptedDetenteurs || [];
    const list = Array.isArray(accepted) ? accepted : [];
    if (list.length === 0) return '-';
    return (
      <div className="flex flex-wrap gap-1">
        {list.map((detenteur) => (
          <Badge key={getId(detenteur) || detenteur} variant="secondary">
            {userLabel(detenteur)}
          </Badge>
        ))}
      </div>
    );
  };

  if (user && user.userValidated === false) {
    return (
      <div className="px-4 sm:px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 mx-auto">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl text-neutral-900 mb-2">Échange d'actifs entre deux membres</h1>
        <p className="text-sm text-neutral-600">Créez une offre d'échange puis recherchez les produits disponibles à l'achat.</p>
      </div>

      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Mise en vente</TabsTrigger>
          <TabsTrigger value="offers">Produits à vendre</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <form onSubmit={handleSubmitOffer} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="detenteurAId">Détenteur W *</Label>
                <Select
                  value={offerForm.detenteurAId}
                  onValueChange={(value) => {
                    setOfferForm((prev) => ({ ...prev, detenteurAId: value, depotAId: '', productAId: '' }));
                    loadDetenteurSites(value);
                  }}
                  disabled={loadingLookups}
                >
                  <SelectTrigger id="detenteurAId" className="bg-white">
                    <SelectValue placeholder="Sélectionner le détenteur du produit A" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((member) => (
                      <SelectItem key={getId(member)} value={getId(member)}>
                        {userLabel(member)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="depotAId">Dépôt *</Label>
                <Select
                  value={offerForm.depotAId}
                  onValueChange={(value) => {
                    setOfferForm((prev) => ({ ...prev, depotAId: value, productAId: '' }));
                    loadSiteActifs(value);
                  }}
                  disabled={!offerForm.detenteurAId || loadingSites}
                >
                  <SelectTrigger id="depotAId" className="bg-white">
                    <SelectValue placeholder={offerForm.detenteurAId ? 'Sélectionner le dépôt' : "Choisissez d'abord le détenteur"} />
                  </SelectTrigger>
                  <SelectContent>
                    {detenteurSites.map((site) => (
                      <SelectItem key={getId(site)} value={getId(site)}>
                        {siteLabel(site)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="productAId">Produit A vendu * {selectedProductA?.quantite != null && (
                  <div className="text-xs text-neutral-500">Disponible: {formatThousands(selectedProductA.quantite)}</div>
                )}</Label>
                <Select
                  value={offerForm.productAId}
                  onValueChange={(value) => setOfferForm((prev) => ({ ...prev, productAId: value }))}
                  disabled={!offerForm.depotAId || loadingActifs}
                >
                  <SelectTrigger id="productAId" className="bg-white">
                    <SelectValue placeholder={offerForm.depotAId ? 'Sélectionner le produit A' : "Choisissez d'abord le dépôt"} />
                  </SelectTrigger>
                  <SelectContent>
                    {actifOptions.map((actif) => (
                      <SelectItem key={actif.id} value={actif.id}>
                        {actif.label}{actif.quantite != null ? ` - Qté: ${formatThousands(actif.quantite)}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              </div>

              <div className="grid gap-2">
                <Label htmlFor="quantiteA">Quantité de produit A *</Label>
                <Input
                  id="quantiteA"
                  type="number"
                  min="1"
                  max={selectedProductA?.quantite ?? undefined}
                  value={offerForm.quantiteA}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, quantiteA: event.target.value }))}
                  className="bg-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="productBId">Produit B de contrepartie *</Label>
                <Select
                  value={offerForm.productBId}
                  onValueChange={(value) => setOfferForm((prev) => ({ ...prev, productBId: value }))}
                  disabled={loadingLookups}
                >
                  <SelectTrigger id="productBId" className="bg-white">
                    <SelectValue placeholder="Sélectionner le produit B" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tauxEchange">Taux d'échange *</Label>
                <Input
                  id="tauxEchange"
                  type="number"
                  min="0"
                  step="0.0001"
                  value={offerForm.tauxEchange}
                  onChange={(event) => setOfferForm((prev) => ({ ...prev, tauxEchange: event.target.value }))}
                  placeholder="Quantité de B pour 1 unité de A"
                  className="bg-white"
                />
              </div>
            </div>

            <Card className="border-neutral-200 bg-white">
              <div className="p-4">
                <Label>Détenteurs Y acceptés pour le produit B</Label>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-auto">
                  {users.map((member) => {
                    const id = getId(member);
                    return (
                      <label key={id} className="flex items-center gap-2 text-sm text-neutral-700">
                        <Checkbox
                          checked={offerForm.acceptedDetenteurBIds.includes(id)}
                          onCheckedChange={(checked) => toggleAcceptedDetenteur(id, checked === true)}
                        />
                        <span className="min-w-0 wrap-wrap-break-word">{userLabel(member)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" status={creating ? 'loading' : 'active'} color="default" disabled={creating} className="w-full sm:w-auto">
                {creating ? 'Création...' : "Créer l'offre d'échange"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 mb-5">
            <Select value={filters.productAId} onValueChange={(value) => setFilters((prev) => ({ ...prev, productAId: value }))}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Produit A" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits A</SelectItem>
                {productOptions.map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.productBId} onValueChange={(value) => setFilters((prev) => ({ ...prev, productBId: value }))}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Produit B" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les contreparties</SelectItem>
                {productOptions.map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.detentaireAId} onValueChange={(value) => setFilters((prev) => ({ ...prev, detentaireAId: value }))}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Détenteur W" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les détenteurs W</SelectItem>
                {users.map((member) => (
                  <SelectItem key={getId(member)} value={getId(member)}>{userLabel(member)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.acceptedDetenteurBId} onValueChange={(value) => setFilters((prev) => ({ ...prev, acceptedDetenteurBId: value }))}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Détenteur Y" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les détenteurs Y</SelectItem>
                {users.map((member) => (
                  <SelectItem key={getId(member)} value={getId(member)}>{userLabel(member)}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="number"
              min="0"
              step="0.0001"
              placeholder="Taux min"
              value={filters.minTaux}
              onChange={(event) => setFilters((prev) => ({ ...prev, minTaux: event.target.value }))}
              className="bg-white"
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2 xl:col-span-1">
              <Input
                type="number"
                min="0"
                step="0.0001"
                placeholder="Taux max"
                value={filters.maxTaux}
                onChange={(event) => setFilters((prev) => ({ ...prev, maxTaux: event.target.value }))}
                className="bg-white"
              />
              <Button type="submit" status={loadingOffers ? 'loading' : 'active'} color="default" disabled={loadingOffers} className="w-full sm:w-auto">
                Filtrer
              </Button>
            </div>
          </form>

          {loadingOffers ? (
            <div className="text-center text-neutral-400 py-12">Chargement...</div>
          ) : offers.length === 0 ? (
            <div className="text-center text-neutral-400 py-12">Aucune offre d'échange trouvée</div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table className="min-w-245 table-auto">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit A</TableHead>
                      <TableHead>Qté A</TableHead>
                      <TableHead>Produit B</TableHead>
                      <TableHead>Taux</TableHead>
                      <TableHead>Détenteur W</TableHead>
                      <TableHead>Détenteurs Y acceptés</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offers.map((offer) => (
                      <TableRow key={getId(offer)}>
                        <TableCell className="font-medium text-neutral-900">{productLabel(offer.productAId || offer.productA)}</TableCell>
                        <TableCell>{offer.quantiteA != null ? formatThousands(offer.quantiteA) : '-'}</TableCell>
                        <TableCell>{productLabel(offer.productBId || offer.productB)}</TableCell>
                        <TableCell>{offer.tauxEchange != null ? formatThousands(offer.tauxEchange) : '-'}</TableCell>
                        <TableCell>{userLabel(offer.detentaireAId || offer.detenteurA || offer.detentaireA)}</TableCell>
                        <TableCell>{renderAcceptedDetenteurs(offer)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            color="default"
                            onClick={() => {
                              setSelectedOffer(offer);
                              setBuyQuantity('');
                              setBuyDialogOpen(true);
                            }}
                          >
                            Acheter
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden">
                {offers.map((offer) => (
                  <Card key={getId(offer)} className="border-neutral-200 bg-white">
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-neutral-500">Produit A</div>
                        <div className="font-medium text-neutral-900 wrap-break-word">{productLabel(offer.productAId || offer.productA)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-neutral-500">Quantité A</div>
                          <div className="text-neutral-900">{offer.quantiteA != null ? formatThousands(offer.quantiteA) : '-'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-500">Taux</div>
                          <div className="text-neutral-900">{offer.tauxEchange != null ? formatThousands(offer.tauxEchange) : '-'}</div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs text-neutral-500">Produit B</div>
                        <div className="text-neutral-900 wrap-break-word">{productLabel(offer.productBId || offer.productB)}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs text-neutral-500">Détenteur W</div>
                        <div className="text-neutral-900 wrap-break-word">{userLabel(offer.detentaireAId || offer.detenteurA || offer.detentaireA)}</div>
                      </div>
                      <div className="text-sm">
                        <div className="text-xs text-neutral-500 mb-1">Détenteurs Y acceptés</div>
                        {renderAcceptedDetenteurs(offer)}
                      </div>
                      <Button
                        color="default"
                        className="w-full"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setBuyQuantity('');
                          setBuyDialogOpen(true);
                        }}
                      >
                        Acheter
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          <PaginationControls
            page={offersPage}
            total={offersTotal}
            limit={offersLimit}
            loading={loadingOffers}
            onPageChange={setOffersPage}
            onLimitChange={setOffersLimit}
            showLimitSelector
            className="mt-6"
          />
        </TabsContent>
      </Tabs>

      <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acheter l'offre d'échange</DialogTitle>
            <DialogDescription>
              Saisissez la quantité de produit A à acheter. La contrepartie sera vérifiée par le backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="min-w-0 wrap-break-word"><span className="font-bold">Produit A:</span> {productLabel(selectedOffer?.productAId || selectedOffer?.productA)}</div>
              <div className="min-w-0 wrap-break-word"><span className="font-bold">Produit B:</span> {productLabel(selectedOffer?.productBId || selectedOffer?.productB)}</div>
              <div><span className="font-bold">Taux:</span> {selectedOffer?.tauxEchange != null ? formatThousands(selectedOffer.tauxEchange) : '-'}</div>
              <div><span className="font-bold">Disponible:</span> {selectedOffer?.quantiteA != null ? formatThousands(selectedOffer.quantiteA) : '-'}</div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buyQuantity">Quantité à acheter *</Label>
              <Input
                id="buyQuantity"
                type="number"
                min="1"
                max={selectedOffer?.quantiteA ?? undefined}
                value={buyQuantity}
                onChange={(event) => setBuyQuantity(event.target.value)}
                className="bg-white"
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row">
            <Button variant="outline" status="inactive" onClick={() => setBuyDialogOpen(false)} className="w-full sm:w-auto">Annuler</Button>
            <Button status={buying ? 'loading' : 'active'} color="default" disabled={buying} onClick={handleBuyOffer} className="w-full sm:w-auto">
              {buying ? 'Achat...' : 'Valider l\'achat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EchangeActifs;
