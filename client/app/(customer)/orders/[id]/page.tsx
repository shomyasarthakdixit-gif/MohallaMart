"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { OrderTimeline } from "@/components/order/OrderTimeline";

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
  deliveryType: string;
  shop: { name: string, address: string, id: string };
  items: OrderItem[];
  delivery?: {
    deliveryBoy: string | null;
    deliveryBoyPhone: string | null;
  };
}


export default function CustomerOrderDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.get(`/orders/${id}`);
      return res.data.order as Order;
    },
    refetchInterval: (query) => {
      const data = query.state.data as Order | undefined;
      // Keep refetching every 5 seconds until delivered or rejected
      if (data?.status === "DELIVERED" || data?.status === "REJECTED" || data?.status === "CANCELLED") {
        return false;
      }
      return 5000;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/orders/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6 pt-10">
        <div className="h-8 w-24 bg-muted/50 rounded animate-pulse mb-6"></div>
        <div className="h-64 bg-muted/40 rounded-3xl animate-pulse"></div>
        <div className="h-96 bg-muted/40 rounded-3xl animate-pulse"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto p-4 text-center mt-20">
        <h2 className="text-2xl font-bold">Order not found</h2>
        <Link href="/orders" className="text-primary hover:underline mt-4 inline-block">Go back to orders</Link>
      </div>
    );
  }

  const isRejected = order.status === "REJECTED" || order.status === "CANCELLED";
  return (
    <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-500 pb-24">
      <Link href="/orders" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Order #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-muted-foreground font-medium mt-1">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
        <div className="flex items-center gap-4">
          {order.status === "PENDING" && (
            <Button 
              variant="destructive" 
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  cancelMutation.mutate();
                }
              }}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}
          <div className="text-xl font-extrabold px-4 py-2 bg-secondary/10 text-secondary rounded-xl inline-block border border-secondary/20">
            ₹{order.totalAmount}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          <Card className="rounded-3xl border-border shadow-sm bg-surface">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="font-serif">Track Order</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <OrderTimeline 
                status={order.status} 
                deliveryBoy={order.delivery?.deliveryBoy} 
                deliveryBoyPhone={order.delivery?.deliveryBoyPhone} 
              />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="rounded-3xl border-border shadow-sm bg-surface">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="font-serif">Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
                        {item.product.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover mix-blend-multiply rounded-xl" />
                        ) : (
                          <Package className="w-6 h-6 opacity-50" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold line-clamp-1">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                    </div>
                    <div className="font-bold text-lg">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 bg-muted/10 border-t border-border space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Delivery Fee ({order.deliveryType})</span>
                  <span>₹{order.totalAmount - order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="pt-3 border-t border-border mt-3 flex justify-between font-extrabold text-xl">
                  <span>Total</span>
                  <span className="text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border shadow-sm bg-surface">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Shop Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">{order.shop.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{order.shop.address}</div>
                </div>
              </div>
              <Link href={`/shop/${order.shop.id}`}>
                <div className="w-full text-center text-sm font-bold text-primary bg-primary/10 py-2.5 rounded-xl hover:bg-primary/20 transition-colors mt-2 block">
                  Visit Shop
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-sm bg-surface">
            <CardHeader>
              <CardTitle className="font-serif text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Delivery Address</div>
                  <div className="text-sm text-muted-foreground mt-1">This order is placed for the current location. Address details support coming soon.</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <span className="text-xs font-bold bg-secondary/10 text-secondary uppercase px-2 py-1 rounded">Payment</span>
                <span className="text-sm font-bold">Cash on Delivery</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
