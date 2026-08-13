"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, ShoppingBag, IndianRupee } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  totalUsers: number;
  totalShops: number;
  activeShops: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [windowStr, setWindowStr] = useState("7d");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", windowStr],
    queryFn: async () => {
      const res = await api.get(`/admin/analytics?window=${windowStr}`);
      return { analytics: res.data.analytics as AnalyticsData, chartData: res.data.chartData };
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
              <div className="text-2xl font-bold">{data.analytics.totalUsers}</div>
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
              <div className="text-2xl font-bold">{data.analytics.activeShops}</div>
              <p className="text-xs text-muted-foreground mt-1">out of {data.analytics.totalShops} total registered</p>
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
              <div className="text-2xl font-bold">{data.analytics.totalOrders}</div>
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
              <div className="text-2xl font-bold">₹{data.analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-primary-foreground/60 mt-1">Total transaction volume</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
            <CardTitle>Platform Growth</CardTitle>
            <div className="flex gap-2">
              {["7d", "21d", "30d", "6m", "1y"].map(w => (
                <button
                  key={w}
                  onClick={() => setWindowStr(w)}
                  className={`text-xs px-2 py-1 rounded ${windowStr === w ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                >
                  {w}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return `${date.getDate()}/${date.getMonth()+1}`;
                  }} 
                  tick={{fontSize: 12}} 
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{fontSize: 12}} 
                  stroke="var(--muted-foreground)"
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" name="New Users" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} activeDot={{r: 6, fill: '#3b82f6', stroke: 'var(--background)', strokeWidth: 2}} />
                <Area type="monotone" name="Orders Placed" dataKey="orders" stroke="var(--primary)" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={3} activeDot={{r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2}} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
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
