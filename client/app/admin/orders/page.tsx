"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Calendar, MapPin, IndianRupee } from "lucide-react";
import { format } from "date-fns";

interface OrderData {
  id: string;
  totalAmount: number;
  status: string;
  deliveryType: string;
  createdAt: string;
  shop: { name: string };
  user: { name: string; email: string };
  payment: { status: string; method: string } | null;
  _count: { items: number };
}

export default function AdminOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await api.get("/admin/orders");
      return res.data.orders as OrderData[];
    }
  });

  if (isLoading) {
    return <div className="p-4 text-center mt-20">Loading orders...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Global Orders</h1>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID & Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Shop</th>
                <th className="px-6 py-4 font-medium">Amount & Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-mono text-xs font-semibold text-foreground">
                          {order.id.split('-')[0].toUpperCase()}
                        </div>
                        <div className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.user.name}</div>
                    <div className="text-muted-foreground text-xs">{order.user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{order.shop.name}</div>
                    <div className="text-muted-foreground text-xs">{order._count.items} items</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground flex items-center">
                      <IndianRupee className="h-3 w-3 mr-0.5" />
                      {order.totalAmount}
                    </div>
                    <div className="text-xs mt-1">
                      <span className={`px-1.5 py-0.5 rounded font-medium
                        ${order.payment?.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                      `}>
                        {order.payment?.method || 'UNKNOWN'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        order.status === 'CANCELLED' ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive' :
                        order.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                    `}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
