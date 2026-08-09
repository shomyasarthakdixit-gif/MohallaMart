"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, ArrowRight, Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shop: { name: string };
  items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await api.get("/orders/me");
      return res.data.orders as Order[];
    }
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "PENDING": return <Clock className="h-4 w-4 text-amber-500" />;
      case "ACCEPTED": return <Package className="h-4 w-4 text-blue-500" />;
      case "PACKING": return <Package className="h-4 w-4 text-blue-500" />;
      case "READY_FOR_DELIVERY": return <Package className="h-4 w-4 text-indigo-500" />;
      case "OUT_FOR_DELIVERY": return <Truck className="h-4 w-4 text-orange-500" />;
      case "DELIVERED": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "REJECTED":
      case "CANCELLED": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "ACCEPTED": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "PACKING": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "READY_FOR_DELIVERY": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "OUT_FOR_DELIVERY": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "DELIVERED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "REJECTED":
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ");
  };

  return (
    <div className="container mx-auto p-4 space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-muted/40 animate-pulse rounded-2xl border border-border/50"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50 border-dashed">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-muted-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground/70 mb-6">Looks like you haven't made your first purchase.</p>
          <Link href="/home" className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all">
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
              <Link href={`/orders/${order.id}`}>
                <Card className="hover:border-primary/50 transition-colors cursor-pointer group shadow-sm hover:shadow-md rounded-2xl overflow-hidden border-border/50">
                  <CardContent className="p-0">
                    <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center">
                      <div className="flex-1 space-y-3 w-full">
                        <div className="flex items-start justify-between sm:justify-start sm:gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground font-medium mb-1">
                              {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                            </p>
                            <h3 className="text-lg font-bold">{order.shop.name}</h3>
                          </div>
                          
                          {/* Mobile status */}
                          <div className="sm:hidden">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {formatStatus(order.status)}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {order.items.map(item => `${item.quantity}x ${item.product.name}`).join(", ")}
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t border-border/50 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                        {/* Desktop status */}
                        <div className="hidden sm:block">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {formatStatus(order.status)}
                          </span>
                        </div>
                        
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total</p>
                          <p className="text-xl font-extrabold">₹{order.totalAmount}</p>
                        </div>
                        
                        <div className="hidden sm:flex h-10 w-10 bg-primary/10 rounded-full items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                          <ArrowRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
