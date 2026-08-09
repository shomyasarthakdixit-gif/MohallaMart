"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  if (isLoading) {
    return <div className="p-4 text-center mt-20">Loading shops...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Shops</h1>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Shop Details</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Products</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Store className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{shop.name}</div>
                        <div className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{shop.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{shop.owner.name}</div>
                    <div className="text-muted-foreground text-xs">{shop.owner.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                      ${shop.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        shop.status === 'REJECTED' ? 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}
                    `}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {shop._count.products}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {shop.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => updateStatusMutation.mutate({ id: shop.id, status: 'APPROVED' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => updateStatusMutation.mutate({ id: shop.id, status: 'REJECTED' })}
                            disabled={updateStatusMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {shop.status === 'APPROVED' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => updateStatusMutation.mutate({ id: shop.id, status: 'REJECTED' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Suspend
                        </Button>
                      )}
                      {shop.status === 'REJECTED' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={() => updateStatusMutation.mutate({ id: shop.id, status: 'APPROVED' })}
                          disabled={updateStatusMutation.isPending}
                        >
                          Re-Approve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {shops.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No shops registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
