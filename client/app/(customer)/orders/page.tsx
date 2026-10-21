"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { OrderCard, Order } from "@/components/order/OrderCard";

export default function CustomerOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await api.get("/orders/me");
      return res.data.orders as Order[];
    }
  });

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-foreground">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-muted/40 animate-pulse rounded-2xl border border-border"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-border border-dashed">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-bold text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground/80 mb-6">Looks like you haven't made your first purchase.</p>
          <Link href="/home" className="bg-primary text-primary-foreground font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={order.id}
            >
              <OrderCard order={order} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
