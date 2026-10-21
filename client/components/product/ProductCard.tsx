"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Plus, Minus } from "lucide-react";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
    shop?: { name: string; id: string };
    category?: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { cart, incrementQuantity, decrementQuantity } = useCart();
  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className="h-full bg-surface border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all rounded-2xl overflow-hidden group flex flex-col focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
        <Link href={`/product/${product.id}`} className="flex-1 flex flex-col outline-none">
          <div className="h-40 bg-muted relative overflow-hidden flex items-center justify-center p-4">
            {product.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <ShoppingBasket className="h-12 w-12 text-muted-foreground/20 group-hover:scale-110 transition-transform duration-500" />
            )}
            {product.category && (
              <span className="absolute top-3 left-3 bg-background/95 backdrop-blur shadow-sm text-[10px] font-bold px-2.5 py-1 rounded-full text-foreground uppercase tracking-wider">
                {product.category.name}
              </span>
            )}
          </div>
          <CardContent className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="font-semibold text-base text-foreground leading-tight line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              {product.shop && (
                <p className="text-xs text-muted-foreground truncate">{product.shop.name}</p>
              )}
            </div>
            <div className="mt-4 flex items-end justify-between gap-2">
              <div>
                <span className="text-xs text-muted-foreground line-through mr-1.5 opacity-70">
                  ₹{Math.floor(product.price * 1.2)}
                </span>
                <span className="font-bold text-lg text-foreground">₹{product.price}</span>
              </div>
            </div>
          </CardContent>
        </Link>
        <div className="px-4 pb-4">
          {qty === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full rounded-xl border-border hover:border-primary/50 hover:bg-primary/5 text-primary font-semibold gap-1.5 transition-colors h-9"
              onClick={(e) => {
                e.preventDefault();
                incrementQuantity(product.id);
              }}
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          ) : (
            <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded-xl p-1 shadow-sm h-9">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-8 p-0 hover:bg-black/10 rounded-lg"
                onClick={(e) => {
                  e.preventDefault();
                  decrementQuantity(product.id);
                }}
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="font-bold text-sm flex-1 text-center" aria-live="polite">
                {qty}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-8 p-0 hover:bg-black/10 rounded-lg"
                onClick={(e) => {
                  e.preventDefault();
                  incrementQuantity(product.id);
                }}
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
