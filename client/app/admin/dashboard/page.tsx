"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, ShoppingBag, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface AnalyticsData {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get("/admin/analytics");
      return res.data.analytics as AnalyticsData;
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground mt-20">Loading platform analytics...</div>;
  }

  if (error || !data) {
    return <div className="p-4 text-center text-destructive mt-20">Failed to load analytics. Ensure you have Admin access.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
              <Store className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeShops}</div>
              <p className="text-xs text-muted-foreground mt-1">out of {data.totalShops} total registered</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">Processed across platform</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 shadow-sm bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/80">Platform Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-primary-foreground/80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-primary-foreground/60 mt-1">Total transaction volume</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Additional UI elements like recent platform activity can go here */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Payment Gateway Integration</p>
                <p className="text-xs text-muted-foreground">Operating normally (Test Mode)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Notification Services</p>
                <p className="text-xs text-muted-foreground">Operating normally</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
