"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShoppingBag, Calendar, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

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
    return <div className="p-4 text-center mt-20 text-muted-foreground font-medium">Loading orders...</div>;
  }

  const columns = [
    {
      header: "Order ID & Date",
      cell: (order: OrderData) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-xs font-semibold text-foreground">
              {order.id.split('-')[0].toUpperCase()}
            </div>
            <div className="text-muted-foreground text-xs flex items-center gap-1 mt-1 font-medium">
              <Calendar className="h-3 w-3" />
              {format(new Date(order.createdAt), "MMM d, h:mm a")}
            </div>
          </div>
        </div>
      )
    },
    {
      header: "Customer",
      cell: (order: OrderData) => (
        <div>
          <div className="font-medium text-foreground">{order.user.name}</div>
          <div className="text-muted-foreground text-xs">{order.user.email}</div>
        </div>
      )
    },
    {
      header: "Shop",
      cell: (order: OrderData) => (
        <div>
          <div className="font-medium text-foreground">{order.shop.name}</div>
          <div className="text-muted-foreground text-xs">{order._count.items} items</div>
        </div>
      )
    },
    {
      header: "Amount & Payment",
      cell: (order: OrderData) => (
        <div>
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
        </div>
      )
    },
    {
      header: "Status",
      cell: (order: OrderData) => <AdminStatusBadge status={order.status} />
    }
  ];

  const searchFn = (order: OrderData, query: string) => {
    const q = query.toLowerCase();
    return order.id.toLowerCase().includes(q) || 
           order.user.name.toLowerCase().includes(q) || 
           order.user.email.toLowerCase().includes(q) || 
           order.shop.name.toLowerCase().includes(q);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader 
        title="Global Orders" 
        description="Monitor the 100 most recent transactions across all shops."
      />
      <AdminTable 
        columns={columns} 
        data={orders} 
        searchPlaceholder="Search by Order ID, customer, or shop..." 
        searchFn={searchFn}
        emptyMessage="No recent orders found."
      />
    </div>
  );
}
