"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, MapPin, Plus, Minus, ShoppingBag, Store } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import { ReviewSection } from "@/components/ReviewSection";

interface Product {
  id: string;
  name: string;
  price: number;
  category: { name: string };
}

interface Shop {
  id: string;
  name: string;
  address: string;
  openTime: string;
  closeTime: string;
}

export default function ShopDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { cart, incrementQuantity, decrementQuantity } = useCart();

  const { data: shop, isLoading: isLoadingShop } = useQuery({
    queryKey: ["shop", id],
    queryFn: async () => {
      try {
        const res = await api.get(`/shops/${id}`);
        return res.data.shop as Shop;
      } catch (e) {
        // Fallback mock shop for UI testing
        return {
          id,
          name: "Sharma General Store",
          address: "Sector 15, Rohini, New Delhi",
          openTime: "08:00",
          closeTime: "22:00"
        } as Shop;
      }
    }
  });

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products", id],
    queryFn: async () => {
      try {
        const res = await api.get(`/products?shopId=${id}`);
        return res.data.products as Product[];
      } catch (e) {
        return [];
      }
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category.name)))];
  
  const filteredProducts = products.filter(p => 
    (activeCategory === "All" || p.category.name === activeCategory) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const totalPrice = cart?.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

  if (isLoadingShop) {
    return <div className="container mx-auto p-4 text-center mt-20">Loading shop details...</div>;
  }

  if (!shop) {
    return <div className="container mx-auto p-4 text-center mt-20">Shop not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-8 animate-in fade-in duration-700 pb-32">
      <Link href="/home" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Link>

      {/* Premium Shop Header */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card border border-border/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/20 via-primary/5 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-700" />
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">{shop.name}</h1>
            <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground font-medium">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {shop.address}</span>
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Clock className="h-4 w-4" /> Open Today • {shop.openTime} - {shop.closeTime}
              </span>
            </div>
            <div className="mt-6 flex gap-2">
              <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">Scheduled Delivery</span>
              <span className="text-xs bg-secondary/10 text-secondary px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">Top Rated</span>
            </div>
          </div>
          <div className="hidden sm:flex h-24 w-24 bg-primary/10 rounded-2xl items-center justify-center border border-primary/20 shadow-inner">
             <Store className="h-10 w-10 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Search & Categories */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl pt-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 space-y-4 border-b border-border/50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products in this shop..." 
            className="pl-10 h-12 rounded-full border-border/50 bg-muted/30 focus-visible:ring-primary/20"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary text-primary-foreground shadow-md scale-105' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div>
        {isLoadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 bg-muted/40 animate-pulse rounded-2xl border border-border/50"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50 border-dashed">
             <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
             <h3 className="text-lg font-semibold text-muted-foreground">No products found.</h3>
             <p className="text-sm text-muted-foreground/60">Try searching for something else.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product, i) => {
              const cartItem = cart?.items.find(item => item.productId === product.id);
              const qty = cartItem ? cartItem.quantity : 0;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={product.id}
                >
                  <Card className="flex flex-col justify-between h-full group overflow-hidden border-border/50 hover:border-primary/40 transition-colors shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl">
                    <CardContent className="p-5 relative">
                      <div className="w-full h-32 bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl mb-4 flex items-center justify-center group-hover:scale-[1.02] transition-transform">
                         {/* Placeholder for real product image */}
                         <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wider text-primary/70 mb-1">{product.category.name}</div>
                      <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 h-11">{product.name}</h3>
                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <span className="text-sm text-muted-foreground line-through mr-2 opacity-60">₹{Math.floor(product.price * 1.2)}</span>
                          <span className="font-extrabold text-xl">₹{product.price}</span>
                        </div>
                        {qty === 0 ? (
                          <Button 
                            size="sm" 
                            className="rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 bg-primary text-primary-foreground font-bold"
                            onClick={() => incrementQuantity(product.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 bg-primary text-primary-foreground rounded-xl p-1 shadow-md">
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-black/10" onClick={() => decrementQuantity(product.id)}><Minus className="h-4 w-4" /></Button>
                            <span className="font-bold text-sm w-6 text-center">{qty}</span>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-black/10" onClick={() => incrementQuantity(product.id)}><Plus className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <ReviewSection shopId={shop.id} title="Shop Reviews" />

      {/* Floating Cart Summary */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-40 animate-in slide-in-from-bottom-10">
          <div className="bg-primary text-primary-foreground p-4 rounded-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5" />
              <div>
                <div className="font-semibold">{totalItems} item{totalItems > 1 ? 's' : ''}</div>
                <div className="text-xs opacity-90">₹{totalPrice} plus delivery</div>
              </div>
            </div>
            {/* Using a dummy link for now, next step is the real checkout */}
            <Link href="/cart">
              <Button variant="secondary" className="font-bold">View Cart</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
