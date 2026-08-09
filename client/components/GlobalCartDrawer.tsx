"use client";

import { useState } from "react";
import { ShoppingCart, X, Plus, Minus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

export function GlobalCartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, incrementQuantity, decrementQuantity } = useCart();

  const items = cart?.items || [];
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Group items by shop
  const itemsByShop: Record<string, typeof items> = {};
  items.forEach(item => {
    const shopId = item.product.shop.id;
    if (!itemsByShop[shopId]) itemsByShop[shopId] = [];
    itemsByShop[shopId].push(item);
  });

  return (
    <>
      {/* Floating Cart Button */}
      {totalItems > 0 && !isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 bg-primary text-primary-foreground p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <ShoppingCart className="h-6 w-6" />
          <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
            {totalItems}
          </div>
        </motion.button>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl z-50 flex flex-col border-l"
            >
              <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold">Your Cart</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-black/5">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <ShoppingCart className="h-16 w-16 opacity-20" />
                    <p>Your cart is empty.</p>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Continue Shopping</Button>
                  </div>
                ) : (
                  Object.keys(itemsByShop).map(shopId => {
                    const shopItems = itemsByShop[shopId];
                    const shopName = shopItems[0].product.shop.name;
                    const shopTotal = shopItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0);

                    return (
                      <div key={shopId} className="bg-muted/10 rounded-xl border p-4">
                        <div className="flex items-center gap-2 mb-3 border-b pb-2">
                          <Store className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{shopName}</span>
                        </div>
                        <div className="space-y-3">
                          {shopItems.map(item => (
                            <div key={item.id} className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">₹{item.product.price}</p>
                              </div>
                              <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-1">
                                <button onClick={() => decrementQuantity(item.productId)} className="p-1 hover:bg-black/10 rounded-md transition-colors"><Minus className="h-3 w-3" /></button>
                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                <button onClick={() => incrementQuantity(item.productId)} className="p-1 hover:bg-black/10 rounded-md transition-colors"><Plus className="h-3 w-3" /></button>
                              </div>
                              <div className="text-sm font-semibold w-12 text-right">
                                ₹{item.product.price * item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t flex justify-between text-sm font-medium">
                          <span>Shop Subtotal</span>
                          <span>₹{shopTotal}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {items.length > 0 && (
                <div className="p-4 border-t bg-muted/10">
                  <Link href="/cart" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
