import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getCart, addToCart as addToCartApi, removeCartItem, updateCartItem, clearCart as clearCartApi, checkoutCart } from '../services/cart.service';
import { getAccessToken } from '../services/token.service';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) { setItems([]); return; }
      const res = await getCart(token);
      const itemsArr = Array.isArray(res?.data?.data?.items) ? res.data.data.items : (Array.isArray(res?.data) ? res.data : []);
      const normalized = itemsArr.map(item => ({
        id: item.shopItemId || item._id || item.id,
        shopItemId: item.shopItemId || item._id,
        name: item.productName || '',
        price: Number(item.prixUnitaire ?? 0),
        quantity: Number(item.quantite ?? 1),
        stock: 999,
        category: item.productCategory || '',
        image: item.productImage || '',
      }));
      setItems(normalized);
    } catch (err) {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (user && user.userValidated !== false) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [user, refreshCart]);

  const addToCart = async (shopItemId, quantite = 1) => {
    try {
      const token = getAccessToken();
      if (!token) { toast.error('Veuillez vous connecter'); return; }
      await addToCartApi({ shopItemId, quantite }, token);
      await refreshCart();
      toast.success('Produit ajouté au panier');
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'ajout au panier");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const token = getAccessToken();
      if (!token) return;
      await removeCartItem(itemId, token);
      setItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('removeFromCart error', err);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return true;
    }
    try {
      const token = getAccessToken();
      if (!token) return false;
      await updateCartItem(itemId, { quantite: quantity }, token);
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
      return true;
    } catch (err) {
      console.error('updateQuantity error', err);
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour de la quantité');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;
      await clearCartApi(token);
      setItems([]);
      toast.success('Panier vidé');
    } catch (err) {
      console.error('clearCart error', err);
    }
  };

  const checkout = async (data) => {
    const token = getAccessToken();
    if (!token) { toast.error('Veuillez vous connecter'); return false; }
    await checkoutCart(data, token);
    setItems([]);
    return true;
  };

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);
  const getTotalPrice = () => items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        getTotalItems,
        getTotalPrice,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
