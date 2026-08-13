"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

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

  const { data: orders = [], isLoading, error } = useQuery({
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
    refetchInterval: 5000, // Auto-refresh every 5s for new orders
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
  const activeOrders = orders.filter(o => !["DELIVERED", "REJECTED"].includes(o.status));
  
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your shop today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">From {orders.length} total orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{lowStockProducts.length} items low on stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">4.8 ★</div>
            <p className="text-xs text-muted-foreground mt-1">Based on 124 reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b mb-4">
            <CardTitle>Sales Trend</CardTitle>
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
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(val) => `₹${val}`}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--foreground)' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} activeDot={{r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2}} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.length === 0 ? (
                <div className="text-muted-foreground">All products are well stocked!</div>
              ) : (
                lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.category.name}</div>
                    </div>
                    <div className="text-destructive font-bold">{product.stock} left</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-muted-foreground">No recent orders.</div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div>
                    <div className="font-semibold text-sm truncate max-w-[150px] sm:max-w-[200px]">Order #{order.id.slice(-6).toUpperCase()}</div>
                    <div className="text-sm text-muted-foreground">{order.items.length} items • ₹{order.totalAmount}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${order.status === 'PENDING' ? 'bg-secondary/20 text-secondary-foreground' : 'bg-primary/20 text-primary'}`}>
                      {order.status}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
