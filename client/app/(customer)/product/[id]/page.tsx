"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Clock, Store, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import { ReviewSection } from "@/components/ReviewSection";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: { name: string };
  shop: {
    id: string;
    name: string;
    address: string;
    openTime: string;
    closeTime: string;
  };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { cart, incrementQuantity, decrementQuantity } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.product as Product;
    }
  });

  const cartItem = cart?.items.find(item => item.productId === id);
  const qty = cartItem ? cartItem.quantity : 0;
  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalPrice = cart?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center mt-20 animate-pulse">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto p-8 text-center mt-20">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link href="/home">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8 animate-in fade-in duration-500 pb-32">
      <Link href="javascript:history.back()" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-border/50 rounded-3xl p-8 sm:p-12 shadow-xl flex items-center justify-center aspect-square relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50"></div>
          <ShoppingBag className="h-32 w-32 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
        </motion.div>

        {/* Product Details Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center space-y-6"
        >
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-primary mb-2">{product.category?.name || "Grocery"}</div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">{product.name}</h1>
            <div className="flex items-end gap-3 mb-6">
              <span className="font-extrabold text-4xl text-foreground">₹{product.price}</span>
              <span className="text-lg text-muted-foreground line-through mb-1 opacity-70">₹{Math.floor(product.price * 1.2)}</span>
            </div>
            {product.description && (
              <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="pt-6 border-t border-border/50">
            <h3 className="text-lg font-bold mb-4">Sold by</h3>
            <Link href={`/shop/${product.shop.id}`}>
              <div className="bg-muted/30 p-4 rounded-2xl flex items-center gap-4 hover:bg-muted/50 transition-colors cursor-pointer border border-border/50 hover:border-primary/30">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">{product.shop.name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {product.shop.address}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="pt-4 flex items-center gap-4">
            {qty === 0 ? (
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 rounded-full shadow-lg hover:shadow-xl transition-all font-bold text-lg h-14"
                onClick={() => incrementQuantity(product.id)}
              >
                <Plus className="h-5 w-5 mr-2" /> Add to Cart
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg h-14">
                <Button size="icon" variant="ghost" className="h-11 w-11 rounded-full hover:bg-black/10" onClick={() => decrementQuantity(product.id)}>
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="font-extrabold text-xl w-12 text-center">{qty}</span>
                <Button size="icon" variant="ghost" className="h-11 w-11 rounded-full hover:bg-black/10" onClick={() => incrementQuantity(product.id)}>
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ReviewSection productId={product.id} title="Product Reviews" />

      {/* Floating Cart Summary */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 animate-in slide-in-from-bottom-10">
          <div className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6" />
              <div>
                <div className="font-bold text-lg leading-none">{totalItems} item{totalItems > 1 ? 's' : ''}</div>
                <div className="text-sm opacity-90 mt-1 font-medium">₹{totalPrice} plus delivery</div>
              </div>
            </div>
            <Link href="/cart">
              <Button variant="secondary" className="font-bold rounded-full px-6">View Cart</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
