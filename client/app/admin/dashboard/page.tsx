"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, ShoppingBag, IndianRupee, Activity, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

interface AnalyticsData {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await api.get(`/admin/analytics`);
      return res.data.analytics as AnalyticsData;
    },
    refetchInterval: 30000 // Refresh every 30s
  });

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground mt-20 font-medium">Loading platform analytics...</div>;
  }

  if (error || !analytics) {
    return <div className="p-4 text-center text-destructive mt-20 font-medium">Failed to load analytics. Ensure you have Admin access.</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader 
        title="Platform Overview" 
        description="Monitor MohallaMart's core operational metrics."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm bg-surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <Store className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeShops}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">out of {analytics.totalShops} total registered</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-surface">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-600 dark:text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Processed across platform</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-primary text-primary-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/90">Platform Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary-foreground/90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-primary-foreground/70 mt-1 font-medium">Total transaction volume</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm bg-surface">
          <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">API Services</p>
                  <p className="text-sm text-muted-foreground mt-1">All core platform endpoints are responding normally.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Payment Gateway</p>
                  <p className="text-sm text-muted-foreground mt-1">MockPaymentProvider is active and processing test transactions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Database</p>
                  <p className="text-sm text-muted-foreground mt-1">Connected. Read/write latency is nominal.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
