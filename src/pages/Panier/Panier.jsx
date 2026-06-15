import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../../components/commons/ImageWithFallback';
import { getFullMediaUrl } from '../../services/media.service';
import { getMySites } from '../../services/site.service';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

export default function Panier() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice, checkout } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const [siteDestinationId, setSiteDestinationId] = useState('');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await getMySites({ limit: 100, page: 1 });
        const data = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSites(data);
      } catch (err) {
        console.error('Erreur chargement sites', err);
      }
    };
    fetchSites();
  }, []);

  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!siteDestinationId) {
      toast.error('Veuillez sélectionner un site de livraison');
      return;
    }
    setCheckoutLoading(true);
    try {
      await checkout({ siteDestinationId, observations: observations || undefined });
      toast.success('Commande validée avec succès');
      setCheckoutOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la validation de la commande');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="px-6 mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/boutique')}
            className="border-neutral-300"
          >
            <ArrowBackIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl text-neutral-900">Mon Panier</h1>
            <p className="text-sm text-neutral-600">
              {items.length} {items.length > 1 ? 'articles' : 'article'} dans votre panier
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-12 text-center border-neutral-200 bg-white">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center">
                <ShoppingBagIcon className="w-12 h-12 text-neutral-400" />
              </div>
              <div>
                <h2 className="text-lg text-neutral-900 mb-2">Votre panier est vide</h2>
                <p className="text-sm text-neutral-600 mb-4">
                  Découvrez nos produits et commencez vos achats
                </p>
                <Button
                  onClick={() => navigate('/boutique')}
                  status="active"
                  color="default"
                >
                  Parcourir la boutique
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-neutral-200 bg-white">
                <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
                  <h2 className="text-neutral-900">Articles ({items.length})</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <DeleteOutlineIcon className="w-4 h-4 mr-2" />
                    Vider le panier
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 bg-white border border-neutral-100 rounded-lg shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-neutral-50 rounded-lg overflow-hidden shrink-0 border border-neutral-100">
                          <ImageWithFallback
                            src={item.image ? getFullMediaUrl(item.image) : undefined}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="text-neutral-900 font-semibold truncate">{item.name}</h3>
                              <div className="mt-1"><Badge variant="secondary" className="text-xs">{item.category}</Badge></div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                aria-label="Réduire quantité"
                                className="w-8 h-8 rounded-md border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <RemoveIcon className="w-4 h-4" />
                              </button>
                              <span className="text-neutral-900 w-12 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Augmenter quantité"
                                className="w-8 h-8 rounded-md border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                                disabled={item.quantity >= item.stock}
                              >
                                <AddIcon className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 transition-colors text-sm"
                              >
                                Supprimer
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-neutral-400 hover:text-red-600 transition-colors"
                                aria-label="Supprimer produit"
                              >
                                <CloseIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {item.quantity >= item.stock && (
                            <p className="text-xs text-orange-600 mt-2">Stock maximum atteint</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-neutral-200 p-4 sticky top-6 bg-white">
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Sous-total</span>
                    <span className="text-neutral-900 font-medium">{getTotalPrice().toLocaleString()} Ar</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Livraison</span>
                    <span className="text-neutral-900">Calculée au paiement</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="text-neutral-900 font-bold">Total</span>
                    <span className="text-neutral-900 font-bold">{getTotalPrice().toLocaleString()} Ar</span>
                  </div>
                </div>
                <Button
                  status="active"
                  color="default"
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Procéder au paiement
                </Button>
                <Button
                  variant="outline"
                  status="inactive"
                  onClick={() => navigate('/boutique')}
                  className="w-full border-neutral-300 mt-2"
                >
                  Continuer mes achats
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finaliser la commande</DialogTitle>
            <DialogDescription>Choisissez le site de livraison et ajoutez des observations</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="observations">Observations (optionnel)</Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={e => setObservations(e.target.value)}
                placeholder="Ajouter des observations pour la livraison"
                rows={3}
              />
            </div>
            <div className="border-t pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Articles</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{getTotalPrice().toLocaleString()} Ar</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" status="inactive">Annuler</Button>
            </DialogClose>
            <Button color="default" status={checkoutLoading ? 'loading' : 'active'} disabled={checkoutLoading} onClick={handleCheckout}>
              {checkoutLoading ? 'Traitement...' : 'Confirmer la commande'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
