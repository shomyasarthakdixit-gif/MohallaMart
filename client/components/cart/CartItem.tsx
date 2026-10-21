"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface CartItemProps {
  item: {
    id: string; // cart item id
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      image?: string | null;
    };
  };
}

export function CartItem({ item }: CartItemProps) {
  const { incrementQuantity, decrementQuantity } = useCart();

  return (
    <div className="flex items-start gap-4 py-4 border-b border-border/50 last:border-0 group animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
        {item.product.image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply" />
        ) : (
          <div className="text-2xl opacity-20">🛒</div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-foreground text-sm sm:text-base line-clamp-2">{item.product.name}</h4>
        <div className="font-extrabold text-foreground mt-1">₹{item.product.price}</div>
      </div>
      
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1 shadow-sm">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" 
            onClick={() => decrementQuantity(item.productId)}
            aria-label="Decrease quantity"
          >
            {item.quantity <= 1 ? <Trash2 className="h-4 w-4 text-destructive" /> : <Minus className="h-4 w-4" />}
          </Button>
          <span className="font-bold text-sm w-8 text-center">{item.quantity}</span>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" 
            onClick={() => incrementQuantity(item.productId)}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm font-extrabold text-foreground">
          ₹{item.product.price * item.quantity}
        </div>
      </div>
    </div>
  );
}
