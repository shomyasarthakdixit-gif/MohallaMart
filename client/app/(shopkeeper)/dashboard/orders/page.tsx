"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight, X } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface OrderItem {
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  deliveryType: string;
  createdAt: string;
  user: { name: string; phone: string };
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
  };
}

const STATUS_GROUPS = {
  PENDING: ["PENDING"],
  ACTIVE: ["ACCEPTED", "PACKING", "READY_FOR_DELIVERY", "OUT_FOR_DELIVERY"],
  COMPLETED: ["DELIVERED", "REJECTED", "CANCELLED"]
};

export default function ShopkeeperOrdersPage() {
  const [activeTab, setActiveTab] = useState<"PENDING" | "ACTIVE" | "COMPLETED">("PENDING");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryBoyName, setDeliveryBoyName] = useState("");
  const [deliveryBoyPhone, setDeliveryBoyPhone] = useState("");
  
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["shopOrders"],
    queryFn: async () => {
      const res = await api.get("/orders/shop");
      return res.data.orders as Order[];
    },
    refetchInterval: 5000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, deliveryBoyName, deliveryBoyPhone }: { id: string, status: string, deliveryBoyName?: string, deliveryBoyPhone?: string }) => {
      await api.patch(`/orders/${id}/status`, { status, deliveryBoyName, deliveryBoyPhone });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shopOrders"] });
      if (variables.status === "DELIVERED" || variables.status === "REJECTED" || variables.status === "CANCELLED") {
        setSelectedOrder(null);
      } else {
        setSelectedOrder((prev) => prev ? { ...prev, status: variables.status } : null);
      }
    }
  });

  const getStatusIcon = (status: string) => {
    switch(status) {
      case "PENDING": return <Clock className="h-4 w-4 text-amber-500" />;
      case "ACCEPTED": 
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
      case "ACCEPTED": 
      case "PACKING": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "READY_FOR_DELIVERY": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "OUT_FOR_DELIVERY": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "DELIVERED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "REJECTED":
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-transparent";
    }
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const filteredOrders = orders.filter(o => STATUS_GROUPS[activeTab].includes(o.status));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 relative min-h-screen">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order Management</h1>
        <p className="text-muted-foreground mt-1">Manage and fulfill your incoming orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(["PENDING", "ACTIVE", "COMPLETED"] as const).map(tab => {
          const count = orders.filter(o => STATUS_GROUPS[tab].includes(o.status)).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
            </button>
          );
        })}
      </div>

      {/* Order List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-muted-foreground">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-border/50 border-dashed">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No orders in this tab.</h3>
          </div>
        ) : (
          filteredOrders.map(order => (
            <Card 
              key={order.id} 
              className="cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
              onClick={() => {
                setSelectedOrder(order);
                setShowDeliveryForm(false);
                setDeliveryBoyName("");
                setDeliveryBoyPhone("");
              }}
            >
              <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">Order #{order.id.slice(-6).toUpperCase()}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.replace(/_/g, " ")}
                    </span>
                    {order.deliveryType === "EXPRESS" && (
                      <span className="bg-accent/10 text-accent border border-accent/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Express</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {format(new Date(order.createdAt), "MMM d, h:mm a")} • {order.user?.name || "Customer"} • {order.items.length} items
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                    <p className="font-extrabold text-xl">₹{order.totalAmount}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Slide-out Drawer Overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-2xl border-l border-border/50 z-50 flex flex-col"
            >
              <div className="p-4 sm:p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
                <div>
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <p className="text-sm text-muted-foreground">#{selectedOrder.id.slice(-6).toUpperCase()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full hover:bg-muted">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Customer Info</h3>
                    <div className="font-medium">{selectedOrder.user?.name || "Anonymous"}</div>
                    <div className="text-sm text-muted-foreground">{selectedOrder.user?.phone || "No phone provided"}</div>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivery</h3>
                      <div className="text-sm bg-secondary/10 text-secondary border border-secondary/20 inline-block px-3 py-1 rounded font-bold">
                        {selectedOrder.deliveryType}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment</h3>
                      {selectedOrder.payment ? (
                        <div className={`text-sm inline-block px-3 py-1 rounded font-bold border ${selectedOrder.payment.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : selectedOrder.payment.status === 'REFUNDED' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                          {selectedOrder.payment.method} • {selectedOrder.payment.status}
                        </div>
                      ) : (
                        <div className="text-sm bg-muted text-muted-foreground border-transparent inline-block px-3 py-1 rounded font-bold">
                          PENDING
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="space-y-3 divide-y divide-border/50">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start pt-3 first:pt-0">
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{item.price}</div>
                        </div>
                        <div className="font-bold text-right">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Subtotal</span>
                    <span>₹{selectedOrder.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground font-medium">
                    <span>Delivery Fee</span>
                    <span>₹{selectedOrder.totalAmount - selectedOrder.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50 mt-2 flex justify-between font-extrabold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 sm:p-6 border-t border-border/50 bg-background space-y-3">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">Update Status</h3>
                
                {selectedOrder.status === "PENDING" && (
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 font-bold shadow-md" 
                      onClick={() => handleUpdateStatus(selectedOrder.id, "ACCEPTED")}
                      disabled={updateStatusMutation.isPending}
                    >
                      Accept Order
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 font-bold shadow-md"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "REJECTED")}
                      disabled={updateStatusMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {selectedOrder.status === "ACCEPTED" && (
                  <Button 
                    className="w-full font-bold shadow-md" 
                    onClick={() => handleUpdateStatus(selectedOrder.id, "PACKING")}
                    disabled={updateStatusMutation.isPending}
                  >
                    Start Packing
                  </Button>
                )}

                {selectedOrder.status === "PACKING" && (
                  <Button 
                    className="w-full font-bold shadow-md" 
                    onClick={() => handleUpdateStatus(selectedOrder.id, "READY_FOR_DELIVERY")}
                    disabled={updateStatusMutation.isPending}
                  >
                    Mark Ready for Delivery
                  </Button>
                )}

                {selectedOrder.status === "READY_FOR_DELIVERY" && !showDeliveryForm && (
                  <Button 
                    className="w-full font-bold shadow-md bg-orange-500 hover:bg-orange-600 text-white" 
                    onClick={() => setShowDeliveryForm(true)}
                    disabled={updateStatusMutation.isPending}
                  >
                    Mark Out for Delivery
                  </Button>
                )}

                {selectedOrder.status === "READY_FOR_DELIVERY" && showDeliveryForm && (
                  <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <h4 className="font-bold text-sm">Assign Delivery Partner</h4>
                    <Input 
                      placeholder="Delivery Boy Name" 
                      value={deliveryBoyName} 
                      onChange={e => setDeliveryBoyName(e.target.value)} 
                    />
                    <Input 
                      placeholder="Phone Number (optional)" 
                      value={deliveryBoyPhone} 
                      onChange={e => setDeliveryBoyPhone(e.target.value)} 
                    />
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowDeliveryForm(false)}>Cancel</Button>
                      <Button 
                        className="flex-1 font-bold shadow-md bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={!deliveryBoyName || updateStatusMutation.isPending}
                        onClick={() => {
                          updateStatusMutation.mutate({ 
                            id: selectedOrder.id, 
                            status: "OUT_FOR_DELIVERY", 
                            deliveryBoyName, 
                            deliveryBoyPhone 
                          });
                          setShowDeliveryForm(false);
                        }}
                      >
                        Confirm Out
                      </Button>
                    </div>
                  </div>
                )}

                {selectedOrder.status === "OUT_FOR_DELIVERY" && (
                  <Button 
                    className="w-full font-bold shadow-md bg-emerald-500 hover:bg-emerald-600 text-white" 
                    onClick={() => handleUpdateStatus(selectedOrder.id, "DELIVERED")}
                    disabled={updateStatusMutation.isPending}
                  >
                    Mark Delivered
                  </Button>
                )}

                {["DELIVERED", "REJECTED", "CANCELLED"].includes(selectedOrder.status) && (
                  <div className="text-center p-3 bg-muted/50 rounded-xl font-bold text-muted-foreground border border-border/50">
                    Order is {selectedOrder.status.toLowerCase()}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
