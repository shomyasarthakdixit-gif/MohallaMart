import { create } from 'zustand';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  shopId: string | null;
  items: CartItem[];
  addItem: (shopId: string, product: { id: string; name: string; price: number }, delta: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  shopId: null,
  items: [],
  addItem: (shopId, product, delta) => {
    set((state) => {
      // If adding from a different shop, clear cart first
      if (state.shopId && state.shopId !== shopId && delta > 0) {
        return {
          shopId,
          items: [{ productId: product.id, name: product.name, price: product.price, quantity: delta }]
        };
      }

      const existingItem = state.items.find(i => i.productId === product.id);
      let newItems = [...state.items];

      if (existingItem) {
        const nextQty = Math.max(0, existingItem.quantity + delta);
        if (nextQty === 0) {
          newItems = newItems.filter(i => i.productId !== product.id);
        } else {
          newItems = newItems.map(i => i.productId === product.id ? { ...i, quantity: nextQty } : i);
        }
      } else if (delta > 0) {
        newItems.push({ productId: product.id, name: product.name, price: product.price, quantity: delta });
      }

      return {
        shopId: newItems.length > 0 ? shopId : null,
        items: newItems
      };
    });
  },
  clearCart: () => set({ shopId: null, items: [] }),
  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
}));
