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
import { getFullMediaUrl } from '../../services/media.service';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import UserNotValidatedBanner from '../../components/commons/UserNotValidatedBanner.jsx';

export default function Panier() {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  const { user } = useAuth();
  if (user && user.userValidated === false) {
    return (
      <div className="px-6 mx-auto">
        <UserNotValidatedBanner />
      </div>
    );
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    toast.success('Commande en cours de traitement...');
  };

  return (
    <div className="px-6 mx-auto">
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
            {/* Cart Items */}
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
                            src={item.image ? getFullMediaUrl(item.image) : 'https://images.unsplash.com/photo-1600000000000-00000000?w=200&q=80'}
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

            {/* Order Summary */}
            <div className="space-y-4">
              <Card className="border-neutral-200 p-4 sticky top-6 bg-white"> 
                <Button
                  status="active"
                  onClick={handleCheckout}
                  status="active"
                  color="default"
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
    </div>
  );
}
