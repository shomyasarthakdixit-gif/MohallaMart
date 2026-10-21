"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { ShopkeeperSidebar } from "@/components/shopkeeper/layout/ShopkeeperSidebar";
import { ShopkeeperHeader } from "@/components/shopkeeper/layout/ShopkeeperHeader";
import Link from "next/link";
import { LayoutDashboard, ShoppingBag, Package } from "lucide-react";

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isLoading && (!user || user.role !== "SHOPKEEPER")) {
      router.replace("/");
    }
  }, [user, isLoading, hasHydrated, router]);

  if (!hasHydrated || (!user || user.role !== "SHOPKEEPER")) {
    return null; // prevent flashing
  }

  return (
    <div className="min-h-screen flex bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Sidebar for Desktop */}
      <ShopkeeperSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <ShopkeeperHeader />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 bg-background md:bg-muted/10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-surface/95 backdrop-blur-md h-16 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
         <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-bold tracking-wider">Dash</span>
        </Link>
        <Link href="/dashboard/orders" className="flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px] font-bold tracking-wider">Orders</span>
        </Link>
        <Link href="/dashboard/products" className="flex flex-col items-center gap-1 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-bold tracking-wider">Items</span>
        </Link>
      </nav>
    </div>
  );
}
