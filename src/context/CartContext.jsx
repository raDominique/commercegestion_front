import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Load cart from localStorage for the current user
  useEffect(() => {
    const getUserIds = (u) => {
      if (!u) return [];
      return Array.from(new Set([u._id, u.id, u.userId, u.sub].filter(Boolean)));
    };

    const normalizeItem = (it) => {
      if (!it) return null;
      const id = it.id || it._id || it.productId || (it.produit && (it.produit._id || it.produit.id)) || null;
      const price = Number(it.price ?? it.prixUnitaire ?? it.prix ?? it.unitPrice ?? (it.produit && (it.produit.prixUnitaire ?? it.produit.price)) ?? 0);
      const name = it.name || it.productName || (it.produit && it.produit.productName) || (it.product && it.product.productName) || '';
      const stock = Number(it.stock ?? it.quantite ?? it.available ?? 0) || 0;
      const category = it.category || it.productCategory || (it.produit && it.produit.productCategory) || '';
      const image = it.image || it.productImage || (it.produit && it.produit.productImage) || '';
      const quantity = Number(it.quantity ?? it.qty ?? 1) || 1;
      return { id, name, price, stock, category, image, quantity };
    };

    try {
      const ids = getUserIds(user);
      let parsed = null;
      // Try all candidate user ids
      for (const id of ids) {
        const key = `cart_${id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          parsed = JSON.parse(stored);
          break;
        }
      }
      // Fallback to generic cart key
      if (!parsed) {
        const stored = localStorage.getItem('cart');
        if (stored) parsed = JSON.parse(stored);
      }
      const normalized = Array.isArray(parsed) ? parsed.map(normalizeItem).filter(Boolean) : [];
      setItems(normalized);
    } catch (e) {
      console.error('Erreur parsing cart from localStorage', e);
      setItems([]);
    }
  }, [user]);

  // Save cart to localStorage for the current user
  useEffect(() => {
    const getUserIds = (u) => {
      if (!u) return [];
      return Array.from(new Set([u._id, u.id, u.userId, u.sub].filter(Boolean)));
    };
    try {
      const ids = getUserIds(user);
      if (ids.length > 0) {
        for (const id of ids) {
          localStorage.setItem(`cart_${id}`, JSON.stringify(items));
        }
      } else {
        // fallback generic cart for anonymous users
        localStorage.setItem('cart', JSON.stringify(items));
      }
    } catch (e) {
      console.error('Erreur saving cart to localStorage', e);
    }
  }, [items, user]);

  const addToCart = (product) => {
    // normalize incoming product
    const normalize = (it) => {
      if (!it) return null;
      const id = it.id || it._id || it.productId || (it.produit && (it.produit._id || it.produit.id)) || null;
      const price = Number(it.price ?? it.prixUnitaire ?? it.prix ?? it.unitPrice ?? (it.produit && (it.produit.prixUnitaire ?? it.produit.price)) ?? 0);
      const name = it.name || it.productName || (it.produit && it.produit.productName) || (it.product && it.product.productName) || '';
      const stock = Number(it.stock ?? it.quantite ?? it.available ?? 0) || 0;
      const category = it.category || it.productCategory || (it.produit && it.produit.productCategory) || '';
      const image = it.image || it.productImage || (it.produit && it.produit.productImage) || '';
      return { id, name, price, stock, category, image };
    };
    const p = normalize(product);
    if (!p || !p.id) return;

    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === p.id);
      if (existingItem) {
        if (existingItem.quantity >= (p.stock || existingItem.stock || Infinity)) return prevItems;
        return prevItems.map((item) =>
          item.id === p.id
            ? { ...item, quantity: (item.quantity || 0) + 1 }
            : item
        );
      }
      return [...prevItems, { ...p, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
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
