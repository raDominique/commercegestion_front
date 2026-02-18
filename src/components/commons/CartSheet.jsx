import { useCart } from '../../context/CartContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useNavigate } from 'react-router';
import { ImageWithFallback } from './ImageWithFallback';

export function CartSheet({ open, onOpenChange }) {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate('/panier');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-white text-neutral-900">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-primary">
            <ShoppingBagIcon className="w-5 h-5 text-primary" />
            Mon Panier ({items.length})
          </SheetTitle>
          <SheetDescription className="text-neutral-500">
            Gérez vos articles et procédez au paiement
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
              <ShoppingBagIcon className="w-10 h-10 text-neutral-400" />
            </div>
            <div>
              <p className="text-neutral-900 mb-1">Votre panier est vide</p>
              <p className="text-sm text-muted-foreground">
                Ajoutez des produits pour commencer vos achats
              </p>
            </div>
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/boutique');
              }}
              variant="default"
            >
              Parcourir la boutique
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 bg-secondary border border-border rounded-lg p-3"
                  >
                    <div className="w-20 h-20 bg-muted rounded-md overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={`https://images.unsplash.com/photo-1600000000000-00000000?w=200&q=80`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-sm text-foreground line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-red-600 transition-colors shrink-0"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-primary mb-3">
                        {item.price.toLocaleString()} FCFA
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon className="w-3 h-3" />
                        </button>
                        <span className="text-sm text-foreground w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
                          disabled={item.quantity >= item.stock}
                        >
                          <AddIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="flex-col space-y-4 -mx-6 px-6 pt-4 border-t border-border bg-background">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Sous-total</span>
                  <span className="text-sm text-foreground">
                    {getTotalPrice().toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Livraison</span>
                  <span className="text-sm text-foreground">Calculé au paiement</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-foreground">Total</span>
                  <span className="text-lg text-primary">
                    {getTotalPrice().toLocaleString()} FCFA
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full"
                variant="default"
              >
                Voir le panier complet
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
