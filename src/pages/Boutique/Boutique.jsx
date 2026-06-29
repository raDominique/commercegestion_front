import { useState, useEffect } from 'react';
import usePageTitle from '../../utils/usePageTitle.jsx';
import { getShopItems } from '../../services/shop-available.service.js';
import { getFullMediaUrl } from '../../services/media.service.js';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import { Button } from '../../components/ui/button.jsx';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'sonner';
import { formatThousands } from '../../utils/formatNumber.js';
import { Input } from '../../components/ui/input.jsx';
import { Label } from '../../components/ui/label.jsx';
import { Textarea } from '../../components/ui/textarea.jsx';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../components/ui/select.jsx';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../../components/ui/table.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../components/ui/dialog.jsx';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';
import PaginationControls from '../../components/commons/PaginationControls.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { getMySites } from '../../services/site.service.js';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Loader } from '../../components/ui/loader';

const sortOptions = [
  { value: 'createdAt', label: 'Date de création' },
  { value: 'productName', label: 'Nom du produit' },
  { value: 'codeCPC', label: 'Code CPC' },
  { value: 'prixUnitaire', label: 'Prix unitaire' },
];
const orderOptions = [
  { value: 1, label: 'Ascendant' },
  { value: -1, label: 'Descendant' },
];

const Boutique = () => {
  const { user, isAuthenticated } = useAuth();
  const { items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, checkout } = useCart();
  usePageTitle('Boutique');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [fournisseurId, setFournisseurId] = useState('all');
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState(-1);
  const [addingId, setAddingId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedShopItem, setSelectedShopItem] = useState(null);
  const [sites, setSites] = useState([]);
  const [siteDestinationId, setSiteDestinationId] = useState('');
  const [observations, setObservations] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cartQuantityDrafts, setCartQuantityDrafts] = useState({});
  const [updatingQuantityId, setUpdatingQuantityId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit,
          search,
          sortBy: sort,
          order: order === 1 ? 'asc' : 'desc',
        };
        if (fournisseurId && fournisseurId !== 'all') {
          params.fournisseurId = fournisseurId;
          params.vendeurId = fournisseurId;
        }
        const res = await getShopItems(params);
        setProducts(res.data || []);
        setTotal(res.total || 0);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, limit, search, sort, order, fournisseurId]);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await getMySites({ limit: 100, page: 1 });
        const data = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSites(data);
      } catch {
        setSites([]);
      }
    };
    fetchSites();
  }, []);

  useEffect(() => {
    setCartQuantityDrafts(prev => {
      const next = {};
      items.forEach(item => {
        next[item.id] = prev[item.id] ?? String(item.quantity);
      });
      return next;
    });
  }, [items]);

  const vendors = Array.from(new Map(
    products
      .map(i => i.vendeurId || i.vendeur)
      .filter(Boolean)
      .map(v => [v._id, v])
  ).values());

  const handleAddToCart = async (item) => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    const shopId = item._id || item.id;
    setAddingId(shopId);
    try {
      await addToCart(shopId, 1);
    } finally {
      setAddingId(null);
    }
  };

  const handleShowDetail = (item) => {
    setSelectedShopItem(item);
    setDetailOpen(true);
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Le panier est vide');
      return;
    }
    if (!siteDestinationId) {
      toast.error('Veuillez sélectionner un site de livraison');
      return;
    }

    setCheckoutLoading(true);
    try {
      await checkout({ siteDestinationId, observations: observations || undefined });
      toast.success('Commande validée avec succès');
      setSiteDestinationId('');
      setObservations('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la validation de la commande');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCartQuantityChange = (itemId, value) => {
    setCartQuantityDrafts(prev => ({ ...prev, [itemId]: value }));
  };

  const handleValidateCartQuantity = async (item) => {
    const draftValue = cartQuantityDrafts[item.id] ?? String(item.quantity);
    const quantity = Number(draftValue);

    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isInteger(quantity)) {
      toast.error('Veuillez saisir une quantité entière supérieure à 0');
      return;
    }

    if (item.stock != null && quantity > Number(item.stock)) {
      toast.error('Quantité supérieure au stock disponible');
      return;
    }

    if (quantity === item.quantity) {
      return;
    }

    setUpdatingQuantityId(item.id);
    try {
      const updated = await updateQuantity(item.id, quantity);
      if (updated !== false) {
        setCartQuantityDrafts(prev => ({ ...prev, [item.id]: String(quantity) }));
      }
    } finally {
      setUpdatingQuantityId(null);
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
    <div className="px-6 mx-auto">
      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Produits à vendre</TabsTrigger>
          <TabsTrigger value="checkout">Achat rapide</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <div>
            <h1 className="text-2xl text-neutral-900 mb-2">Boutiques</h1>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="w-full md:w-64">
              <Input
                type="text"
                placeholder="Rechercher par nom"
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
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-40">
              <Select value={String(order)} onValueChange={v => { setPage(1); setOrder(Number(v)); }}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Ordre" />
                </SelectTrigger>
                <SelectContent>
                  {orderOptions.map(opt => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                  ))}
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

            <div className="w-full md:w-56">
              <Select value={fournisseurId} onValueChange={v => { setPage(1); setFournisseurId(v); }}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Tous les fournisseurs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les fournisseurs</SelectItem>
                  {vendors.map(v => (
                    <SelectItem key={v._id} value={v._id}>{v.userNickName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Loader message="Chargement..." /></div>
          ) : products.length === 0 ? (
            <div className="text-center text-neutral-400 py-12">Aucun produit trouvé</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map(item => {
                const product = item.productId || item.produit || {};
                const vendeur = item.vendeurId || item.vendeur || null;
                const site = item.siteId || item.site || {};
                const key = item._id || item.id || product._id || product.id;
                return (
                  <Card key={key} className="border border-neutral-200 bg-white rounded-lg overflow-hidden">
                    <CardHeader className="p-0">
                      <div className="relative">
                        <img
                          src={getFullMediaUrl(product.productImage)}
                          alt={product.productName}
                          className="w-full h-40 object-cover"
                        />
                        <div className="absolute top-3 right-3 bg-white/95 text-sm text-neutral-900 px-2 py-1 rounded-md border border-neutral-200 font-bold">
                          {item.prixUnitaire != null ? `${formatThousands(item.prixUnitaire)} Ar` : '-'}
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <CardTitle className="text-lg font-semibold text-neutral-900 line-clamp-2 mb-1">{product.productName}</CardTitle>
                        {product.productCategory && (
                          <Badge variant="secondary" className="mt-1">{product.productCategory}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <div className="text-sm text-neutral-700"><span className="font-bold">Code CPC:</span> {product.codeCPC || '-'}</div>
                        <div className="text-sm text-neutral-700"><span className="font-bold">Quantité:</span> {item.quantite != null ? formatThousands(item.quantite) : '-'}</div>
                        <div className="text-sm text-neutral-700"><span className="font-bold">Fournisseur:</span> {vendeur?.userNickName || product.productOwnerId || '-'}</div>
                        <div className="text-sm text-neutral-700"><span className="font-bold">Adresse:</span> {site?.siteAddress || '-'}</div>
                      </div>
                      <div className="mt-3">
                        <Button
                          onClick={() => handleAddToCart(item)}
                          disabled={addingId === (item._id || item.id)}
                          status={addingId === (item._id || item.id) ? 'loading' : 'active'}
                          color="default"
                          className="w-full"
                        >
                          {addingId === (item._id || item.id) && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                          <AddShoppingCartIcon className="w-4 h-4" />
                          Ajouter au panier
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="mt-8" />
        </TabsContent>

        <TabsContent value="checkout" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl text-neutral-900 mb-2">Achat rapide</h1>
              <p className="text-sm text-neutral-600">Sélectionnez les produits à gauche, ajustez le panier à droite.</p>
            </div>
            <div className="w-full md:w-72">
              <Input
                type="text"
                placeholder="Rechercher un produit"
                className="bg-white"
                value={search}
                onChange={e => { setPage(1); setSearch(e.target.value); }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
            <Card className="border-neutral-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900">Liste des produits</h2>
                <span className="text-sm text-neutral-500">{total} produit(s)</span>
              </div>

              {loading ? (
                <div className="flex justify-center py-8"><Loader message="Chargement..." /></div>
              ) : products.length === 0 ? (
                <div className="text-center text-neutral-400 py-12">Aucun produit trouvé</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-28 whitespace-nowrap">Code article</TableHead>
                        <TableHead className="whitespace-nowrap">Désignation</TableHead>
                        <TableHead className="w-32 text-right whitespace-nowrap">Prix unitaire</TableHead>
                        <TableHead className="w-24 text-right whitespace-nowrap">Stock réel</TableHead>
                        <TableHead className="w-24 text-right whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map(item => {
                        const product = item.productId || item.produit || {};
                        const key = item._id || item.id || product._id || product.id;
                        const shopId = item._id || item.id;
                        return (
                          <TableRow key={key} className="odd:bg-neutral-50">
                            <TableCell className="font-medium text-neutral-800 whitespace-nowrap">{product.codeCPC || '-'}</TableCell>
                            <TableCell className="text-neutral-900 whitespace-nowrap truncate">{product.productName || '-'}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{item.prixUnitaire != null ? formatThousands(item.prixUnitaire) : '-'}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">{item.quantite != null ? formatThousands(item.quantite) : '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="icon"
                                  color="default"
                                  status={addingId === shopId ? 'loading' : 'active'}
                                  disabled={addingId === shopId}
                                  onClick={() => handleAddToCart(item)}
                                  title="Ajouter au panier"
                                  aria-label="Ajouter au panier"
                                  className="size-8"
                                >
                                  {addingId === shopId ? <Loader size="sm" className="border-white border-t-transparent shrink-0" /> : <AddShoppingCartIcon className="w-4 h-4" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleShowDetail(item)}
                                  title="Voir détails"
                                  aria-label="Voir détails"
                                  className="size-8 border-neutral-300"
                                >
                                  <InfoOutlinedIcon className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <PaginationControls page={page} total={total} limit={limit} loading={loading} onPageChange={setPage} className="p-4" />
                </>
              )}
            </Card>

            <Card className="border-neutral-200 bg-white overflow-hidden">
              <div className="px-4 py-3 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-neutral-900">Panier</h2>
                  <p className="text-sm text-neutral-500">{items.length} article(s)</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-600">Date : {new Date().toLocaleDateString('fr-FR')}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={clearCart}
                    disabled={items.length === 0}
                    title="Vider le panier"
                    aria-label="Vider le panier"
                    className="size-8 border-neutral-300 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <DeleteSweepIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                {items.length === 0 ? (
                  <div className="text-center text-neutral-400 py-12">Aucun produit dans le panier</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Désignation</TableHead>
                        <TableHead className="w-36 text-right whitespace-nowrap">Qté</TableHead>
                        <TableHead className="w-28 text-right whitespace-nowrap">P.U.</TableHead>
                        <TableHead className="w-32 text-right whitespace-nowrap">Montant</TableHead>
                        <TableHead className="w-16 text-right whitespace-nowrap">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map(item => {
                        const draftQuantity = cartQuantityDrafts[item.id] ?? String(item.quantity);
                        const quantityChanged = draftQuantity !== String(item.quantity);
                        const quantityIsUpdating = updatingQuantityId === item.id;

                        return (
                          <TableRow key={item.id} className="odd:bg-neutral-50">
                            <TableCell className="font-medium text-neutral-900 whitespace-nowrap truncate">{item.name || '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Input
                                  type="number"
                                  min="1"
                                  max={item.stock}
                                  step="1"
                                  value={draftQuantity}
                                  onChange={(event) => handleCartQuantityChange(item.id, event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                      event.preventDefault();
                                      handleValidateCartQuantity(item);
                                    }
                                  }}
                                  className="h-8 w-20 bg-white text-right"
                                />
                                <Button
                                  size="icon"
                                  variant="outline"
                                  status={quantityIsUpdating ? 'loading' : null}
                                  disabled={quantityIsUpdating || !quantityChanged}
                                  onClick={() => handleValidateCartQuantity(item)}
                                  title="Valider la quantité"
                                  aria-label="Valider la quantité"
                                  className="size-8 border-neutral-300"
                                >
                                  {quantityIsUpdating ? <Loader size="sm" className="border-white border-t-transparent shrink-0" /> : <CheckCircleOutlineIcon className="w-4 h-4" />}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right whitespace-nowrap">{formatThousands(item.price)}</TableCell>
                            <TableCell className="text-right font-medium whitespace-nowrap">{formatThousands(item.price * item.quantity)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.id)}
                                title="Retirer du panier"
                                aria-label="Retirer du panier"
                                className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <DeleteOutlineIcon className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}

                <div className="px-4 py-4 border-t border-neutral-200 space-y-4">
                  <div className="flex items-center justify-end gap-6">
                    <span className="text-sm font-semibold text-neutral-700 whitespace-nowrap">TOTAL</span>
                    <span className="min-w-32 text-right text-lg font-bold text-neutral-900 whitespace-nowrap">{formatThousands(getTotalPrice())} Ar</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="siteDestinationId">Site de livraison *</Label>
                      <Select value={siteDestinationId} onValueChange={setSiteDestinationId}>
                        <SelectTrigger id="siteDestinationId" className="bg-white">
                          <SelectValue placeholder="Sélectionner un site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.length === 0 ? (
                            <div className="px-2 py-4 text-sm text-neutral-500 text-center">Aucun site de livraison disponible</div>
                          ) : (
                            sites.map(site => (
                              <SelectItem key={site._id || site.id} value={site._id || site.id}>
                                {site.siteName || site.name || site.siteAddress || site._id}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="observations">Observations</Label>
                      <Textarea
                        id="observations"
                        value={observations}
                        onChange={e => setObservations(e.target.value)}
                        placeholder="Observations pour la livraison"
                        rows={2}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      color="default"
                      status={checkoutLoading ? 'loading' : 'active'}
                      disabled={checkoutLoading || items.length === 0}
                      onClick={handleCheckout}
                    >
                      {checkoutLoading && <Loader size="sm" className="border-white border-t-transparent shrink-0" />}
                      <ShoppingCartCheckoutIcon className="w-4 h-4" />
                      Valider l'achat
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détail produit</DialogTitle>
            <DialogDescription>Informations du produit disponible à la vente.</DialogDescription>
          </DialogHeader>

          {selectedShopItem && (() => {
            const product = selectedShopItem.productId || selectedShopItem.produit || {};
            const vendeur = selectedShopItem.vendeurId || selectedShopItem.vendeur || null;
            const site = selectedShopItem.siteId || selectedShopItem.site || {};
            return (
              <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-4 text-sm">
                <div className="w-full aspect-square bg-neutral-100 rounded-md overflow-hidden border border-neutral-200">
                  {product.productImage ? (
                    <img
                      src={getFullMediaUrl(product.productImage)}
                      alt={product.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400">-</div>
                  )}
                </div>

                <div className="space-y-2 min-w-0">
                  <div className="text-lg font-semibold text-neutral-900 wrap-break-word">{product.productName || '-'}</div>
                  <div><span className="font-bold">Code CPC :</span> {product.codeCPC || '-'}</div>
                  <div><span className="font-bold">Catégorie :</span> {product.productCategory || '-'}</div>
                  <div><span className="font-bold">Prix unitaire :</span> {selectedShopItem.prixUnitaire != null ? `${formatThousands(selectedShopItem.prixUnitaire)} Ar` : '-'}</div>
                  <div><span className="font-bold">Quantité disponible :</span> {selectedShopItem.quantite != null ? formatThousands(selectedShopItem.quantite) : '-'}</div>
                  <div><span className="font-bold">Fournisseur :</span> {vendeur?.userNickName || product.productOwnerId || '-'}</div>
                  <div><span className="font-bold">Site :</span> {site?.siteName || '-'}</div>
                  <div><span className="font-bold">Adresse :</span> {site?.siteAddress || '-'}</div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Fermer</Button>
            <Button color="default" onClick={() => selectedShopItem && handleAddToCart(selectedShopItem)}>
              <AddShoppingCartIcon className="w-4 h-4" />
              Ajouter au panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default Boutique;
