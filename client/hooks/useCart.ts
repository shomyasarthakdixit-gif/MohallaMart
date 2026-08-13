import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    shop: {
      id: string;
      name: string;
      address: string;
      scheduledDeliveryFee?: number;
      expressDeliveryFee?: number;
    };
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export function useCart() {
  const queryClient = useQueryClient();

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data.cart as Cart;
    }
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const res = await api.post("/cart/item", { productId, quantity });
      return res.data.cart as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add item to cart";
      alert(message);
    }
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      await api.delete("/cart");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const updateQuantity = (productId: string, quantity: number) => {
    addToCartMutation.mutate({ productId, quantity });
  };

  const incrementQuantity = (productId: string) => {
    const item = cart?.items.find(i => i.productId === productId);
    const qty = item ? item.quantity + 1 : 1;
    updateQuantity(productId, qty);
  };

  const decrementQuantity = (productId: string) => {
    const item = cart?.items.find(i => i.productId === productId);
    if (!item) return;
    updateQuantity(productId, item.quantity - 1);
  };

  return {
    cart,
    isLoading,
    error,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart: () => clearCartMutation.mutate(),
    isUpdating: addToCartMutation.isPending
  };
}
