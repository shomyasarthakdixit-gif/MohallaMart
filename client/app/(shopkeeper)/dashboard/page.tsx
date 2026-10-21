"use client";

import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { MetricCard } from "@/components/shopkeeper/dashboard/MetricCard";
import { SalesChart } from "@/components/shopkeeper/dashboard/SalesChart";
import { LowStockAlerts } from "@/components/shopkeeper/dashboard/LowStockAlerts";
import { RecentOrdersList } from "@/components/shopkeeper/dashboard/RecentOrdersList";
import { motion } from "framer-motion";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { product: { name: string } }[];
}

interface Product {
  id: string;
  name: string;
  stock: number;
  category: { name: string };
}

export default function ShopkeeperDashboard() {
  const [windowStr, setWindowStr] = useState("7d");

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["shopOrders"],
    queryFn: async () => {
      try {
        const res = await api.get("/orders/shop");
        return res.data.orders as Order[];
      } catch (err: any) {
        if (err.response?.status === 404) {
          window.location.href = "/register-shop";
        }
        throw err;
      }
    },
    refetchInterval: 5000,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["shopAnalytics", windowStr],
    queryFn: async () => {
      const res = await api.get(`/orders/shop/analytics?window=${windowStr}`);
      return res.data.chartData;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["myProducts"],
    queryFn: async () => {
      const res = await api.get("/products/me");
      return res.data.products as Product[];
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activeOrders = orders.filter(o => !["DELIVERED", "REJECTED", "CANCELLED"].includes(o.status));
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 pb-20 md:pb-0"
    >
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1 font-medium">Here&apos;s an overview of your shop today.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          title="Total Revenue" 
          value={`₹${totalRevenue}`} 
          subtitle={`From ${orders.length} total orders`} 
          icon={DollarSign} 
          variant="primary" 
        />
        <MetricCard 
          title="Active Orders" 
          value={activeOrders.length} 
          subtitle="Require attention" 
          icon={ShoppingBag} 
        />
        <MetricCard 
          title="Total Products" 
          value={products.length} 
          subtitle={`${lowStockProducts.length} items low on stock`} 
          icon={Package} 
          variant={lowStockProducts.length > 0 ? "warning" : "default"}
        />
        <MetricCard 
          title="Store Rating" 
          value="4.8 ★" 
          subtitle="Based on 124 reviews" 
          icon={TrendingUp} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7 items-stretch">
        <div className="lg:col-span-4 h-full">
          <SalesChart 
            analytics={analytics} 
            windowStr={windowStr} 
            onWindowChange={setWindowStr} 
          />
        </div>
        <div className="lg:col-span-3 h-full">
          <LowStockAlerts products={lowStockProducts} />
        </div>
      </div>
      
      <div>
        <RecentOrdersList orders={orders} isLoading={isLoadingOrders} />
      </div>
    </motion.div>
  );
}
