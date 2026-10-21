"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { OrderList } from "@/components/shopkeeper/orders/OrderList";
import { OrderDetailsDrawer } from "@/components/shopkeeper/orders/OrderDetailsDrawer";
import { motion } from "framer-motion";

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

  const handleUpdateStatus = (id: string, status: string, name?: string, phone?: string) => {
    updateStatusMutation.mutate({ id, status, deliveryBoyName: name, deliveryBoyPhone: phone });
  };

  const filteredOrders = orders.filter(o => STATUS_GROUPS[activeTab].includes(o.status));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-20 md:pb-0 relative min-h-[calc(100vh-8rem)]"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Order Management</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage and fulfill your incoming orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {(["PENDING", "ACTIVE", "COMPLETED"] as const).map(tab => {
          const count = orders.filter(o => STATUS_GROUPS[tab].includes(o.status)).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'bg-surface border border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()} 
              <span className={`ml-2 px-2 py-0.5 rounded-md text-xs ${activeTab === tab ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Order List */}
      <OrderList 
        orders={filteredOrders} 
        isLoading={isLoading} 
        onSelectOrder={setSelectedOrder} 
      />

      {/* Slide-out Drawer Overlay */}
      <OrderDetailsDrawer 
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={updateStatusMutation.isPending}
      />
    </motion.div>
  );
}
