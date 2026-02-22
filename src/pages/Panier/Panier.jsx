import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from '../../components/commons/ImageWithFallback';
import { toast } from 'sonner';

export default function Panier() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const shippingCost = items.length > 0 ? 5000 : 0;
  const totalWithShipping = getTotalPrice() + shippingCost;

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      toast.info('Fonctionnalité de coupon à venir');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error('Veuillez entrer une adresse de livraison');
      return;
    }
    toast.success('Commande en cours de traitement...');
    // Logique de paiement ici
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
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
          <Card className="p-12 text-center border-neutral-200">
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
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                >
                  Parcourir la boutique
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-neutral-200">
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
                <div className="divide-y divide-neutral-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 flex gap-4">
                      <div className="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                        <ImageWithFallback
                          src={`https://images.unsplash.com/photo-1600000000000-00000000?w=200&q=80`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="text-neutral-900 mb-1">{item.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            <CloseIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-lg text-violet-600 mb-3">
                          {item.price.toLocaleString()} Ariary
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-md border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <RemoveIcon className="w-4 h-4" />
                            </button>
                            <span className="text-neutral-900 w-12 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-md border border-neutral-300 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                              disabled={item.quantity >= item.stock}
                            >
                              <AddIcon className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-neutral-600">Total</p>
                            <p className="text-lg text-neutral-900">
                              {(item.price * item.quantity).toLocaleString()} Ariary
                            </p>
                          </div>
                        </div>
                        {item.quantity >= item.stock && (
                          <p className="text-xs text-orange-600 mt-2">
                            Stock maximum atteint
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-neutral-200 text-center">
                  <LocalShippingIcon className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-900 mb-1">Livraison rapide</p>
                  <p className="text-xs text-neutral-600">En 2-3 jours ouvrés</p>
                </Card>
                <Card className="p-4 border-neutral-200 text-center">
                  <ShieldOutlinedIcon className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-900 mb-1">Paiement sécurisé</p>
                  <p className="text-xs text-neutral-600">100% sécurisé</p>
                </Card>
                <Card className="p-4 border-neutral-200 text-center">
                  <CreditCardIcon className="w-6 h-6 text-violet-600 mx-auto mb-2" />
                  <p className="text-sm text-neutral-900 mb-1">Plusieurs moyens</p>
                  <p className="text-xs text-neutral-600">Carte, Mobile Money</p>
                </Card>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="border-neutral-200 p-4 sticky top-6">
                <h2 className="text-neutral-900 mb-4">Résumé de la commande</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Sous-total</span>
                    <span className="text-neutral-900">
                      {getTotalPrice().toLocaleString()} Ariary
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Livraison</span>
                    <span className="text-neutral-900">
                      {shippingCost.toLocaleString()} Ariary
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-xl text-violet-600">
                      {totalWithShipping.toLocaleString()} Ariary
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <Label htmlFor="coupon">Code promo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coupon"
                      placeholder="Entrer le code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="border-neutral-300"
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      className="border-neutral-300"
                    >
                      Appliquer
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <Label htmlFor="address">Adresse de livraison *</Label>
                  <Textarea
                    id="address"
                    placeholder="Entrez votre adresse complète"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="border-neutral-300 min-h-20"
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <Label htmlFor="notes">Notes de commande (optionnel)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Instructions spéciales..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="border-neutral-300 min-h-15"
                  />
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                >
                  <CreditCardIcon className="w-4 h-4 mr-2" />
                  Procéder au paiement
                </Button>

                <Button
                  variant="outline"
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
    </div>
  );
}
