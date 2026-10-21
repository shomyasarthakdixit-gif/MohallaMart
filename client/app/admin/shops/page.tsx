"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Store, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

interface ShopData {
  id: string;
  name: string;
  address: string;
  status: string;
  owner: { name: string; email: string };
  _count: { products: number };
}

export default function AdminShopsPage() {
  const queryClient = useQueryClient();

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const res = await api.get("/admin/shops");
      return res.data.shops as ShopData[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.put(`/admin/shops/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-shops"] });
    }
  });

  const handleUpdateStatus = (id: string, status: string) => {
    if (confirm(`Are you sure you want to change this shop's status to ${status}?`)) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center mt-20 text-muted-foreground font-medium">Loading shops...</div>;
  }

  const columns = [
    {
      header: "Shop Details",
      cell: (shop: ShopData) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{shop.name}</div>
            <div className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{shop.address}</div>
          </div>
        </div>
      )
    },
    {
      header: "Owner",
      cell: (shop: ShopData) => (
        <div>
          <div className="font-medium text-foreground">{shop.owner.name}</div>
          <div className="text-muted-foreground text-xs">{shop.owner.email}</div>
        </div>
      )
    },
    {
      header: "Status",
      cell: (shop: ShopData) => <AdminStatusBadge status={shop.status} />
    },
    {
      header: "Products",
      cell: (shop: ShopData) => (
        <span className="font-medium text-foreground">{shop._count.products}</span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (shop: ShopData) => (
        <div className="flex justify-end gap-2">
          {shop.status === 'PENDING' && (
            <>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                onClick={() => handleUpdateStatus(shop.id, 'APPROVED')}
                disabled={updateStatusMutation.isPending}
              >
                <Check className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleUpdateStatus(shop.id, 'REJECTED')}
                disabled={updateStatusMutation.isPending}
              >
                <X className="h-4 w-4 mr-1" /> Reject
              </Button>
            </>
          )}
          {shop.status === 'APPROVED' && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 font-medium"
              onClick={() => handleUpdateStatus(shop.id, 'REJECTED')}
              disabled={updateStatusMutation.isPending}
            >
              Suspend
            </Button>
          )}
          {shop.status === 'REJECTED' && (
            <Button 
              size="sm" 
              variant="outline"
              className="text-emerald-600 border-emerald-600/30 hover:bg-emerald-500/10 font-medium"
              onClick={() => handleUpdateStatus(shop.id, 'APPROVED')}
              disabled={updateStatusMutation.isPending}
            >
              Re-Approve
            </Button>
          )}
        </div>
      )
    }
  ];

  const searchFn = (shop: ShopData, query: string) => {
    const q = query.toLowerCase();
    return shop.name.toLowerCase().includes(q) || 
           shop.address.toLowerCase().includes(q) || 
           shop.owner.name.toLowerCase().includes(q) || 
           shop.owner.email.toLowerCase().includes(q);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader 
        title="Manage Shops" 
        description="Approve, suspend, and monitor all shops registered on the platform."
      />
      <AdminTable 
        columns={columns} 
        data={shops} 
        searchPlaceholder="Search shops by name, address, or owner..." 
        searchFn={searchFn}
        emptyMessage="No shops registered yet."
      />
    </div>
  );
}
