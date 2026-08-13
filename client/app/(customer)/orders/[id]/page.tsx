"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, Truck, CheckCircle2, Clock, MapPin, Phone, Store } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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

const ORDER_STATES = [
  "PENDING", 
  "ACCEPTED", 
  "PACKING", 
  "READY_FOR_DELIVERY", 
  "OUT_FOR_DELIVERY", 
  "DELIVERED"
];

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
  const currentStateIndex = ORDER_STATES.indexOf(order.status);
  
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
          <Card className="rounded-3xl border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Track Order</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isRejected ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 opacity-0" /> {/* Just to keep size */}
                    <div className="absolute text-3xl">✕</div>
                  </div>
                  <h3 className="text-2xl font-bold text-destructive">Order {order.status === "REJECTED" ? "Rejected" : "Cancelled"}</h3>
                  <p className="text-muted-foreground">Unfortunately, this order could not be fulfilled.</p>
                </div>
              ) : (
                <div className="relative py-4 pl-4 sm:pl-0 sm:py-8">
                  {/* Vertical line for mobile, horizontal for desktop (optional, keeping vertical for simplicity and reliability across sizes) */}
                  <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-muted hidden sm:block"></div>
                  
                  <div className="space-y-8 relative">
                    {[
                      { state: "PENDING", title: "Pending Confirmation", desc: "Waiting for shopkeeper to accept", icon: Clock },
                      { state: "ACCEPTED", title: "Order Accepted", desc: "The shop has accepted your order", icon: Store },
                      { state: "PACKING", title: "Packing", desc: "Your items are being packed", icon: Package },
                      { state: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Order is on the way", icon: Truck },
                      { state: "DELIVERED", title: "Delivered", desc: "Enjoy your order!", icon: CheckCircle2 },
                    ].map((step, idx) => {
                      const stepIndex = ORDER_STATES.indexOf(step.state);
                      const isCompleted = currentStateIndex >= stepIndex;
                      const isCurrent = currentStateIndex === stepIndex;
                      
                      const Icon = step.icon;
                      
                      return (
                        <div key={step.state} className="flex gap-4 sm:gap-6 relative z-10">
                          {/* Desktop Line connection (simplified) */}
                          <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${
                              isCompleted 
                                ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" 
                                : "bg-card border-muted text-muted-foreground"
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            {idx !== 4 && (
                              <div className={`w-0.5 h-full my-2 transition-colors duration-500 ${isCompleted && currentStateIndex > stepIndex ? 'bg-primary' : 'bg-muted'}`}></div>
                            )}
                          </div>
                          
                          <div className={`pt-2 pb-6 flex-1 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                            <h4 className={`font-bold text-lg ${isCurrent ? 'text-primary' : ''}`}>{step.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                            
                            {/* Delivery Partner Info */}
                            {step.state === "OUT_FOR_DELIVERY" && isCompleted && order.delivery?.deliveryBoy && (
                              <div className="mt-3 bg-secondary/5 border border-secondary/20 rounded-xl p-3 max-w-sm">
                                <p className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Delivery Partner</p>
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">{order.delivery.deliveryBoy}</span>
                                  {order.delivery.deliveryBoyPhone && (
                                    <a 
                                      href={`tel:${order.delivery.deliveryBoyPhone}`}
                                      className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors"
                                    >
                                      <Phone className="w-3 h-3" /> Call
                                    </a>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <CardTitle>Items Ordered</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground shrink-0">
                        <Package className="w-6 h-6 opacity-50" />
                      </div>
                      <div>
                        <div className="font-semibold line-clamp-1">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                    </div>
                    <div className="font-bold">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 sm:p-6 bg-muted/10 border-t border-border/50 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span>₹{order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Delivery Fee ({order.deliveryType})</span>
                  <span>₹{order.totalAmount - order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="pt-2 border-t border-border/50 mt-2 flex justify-between font-extrabold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Shop Details</CardTitle>
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

          <Card className="rounded-3xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
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
