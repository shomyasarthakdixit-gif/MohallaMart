"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ShoppingBag, CreditCard, Store } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProfileInsightsCard() {
  const { data: insights, isLoading } = useQuery({
    queryKey: ["userInsights"],
    queryFn: async () => {
      const res = await api.get("/users/me/insights");
      return res.data.insights;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
        <div className="h-32 bg-muted rounded-[16px]"></div>
        <div className="h-32 bg-muted rounded-[16px]"></div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-surface border border-border/50 rounded-[16px] overflow-hidden">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Spent</p>
              <p className="text-3xl font-serif font-bold text-foreground mt-1">₹{insights.totalSpent}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface border border-border/50 rounded-[16px] overflow-hidden">
          <CardContent className="p-6 flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Orders</p>
              <p className="text-3xl font-serif font-bold text-foreground mt-1">{insights.totalOrders}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {insights.favoriteShop && (
        <Card className="bg-surface border border-border/50 rounded-[16px] overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Favorite Shop</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{insights.favoriteShop}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="p-4 bg-muted/30 rounded-[12px] border border-border/50 text-sm text-muted-foreground">
        Profile changes aren&apos;t available yet.
      </div>
    </div>
  );
}
