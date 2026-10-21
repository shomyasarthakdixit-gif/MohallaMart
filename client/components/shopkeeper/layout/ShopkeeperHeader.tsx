"use client";

import Link from "next/link";
import { Store, Package, ShoppingBag, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { LogoutButton } from "@/components/logout-button";
import { usePathname } from "next/navigation";

export function ShopkeeperHeader() {
  const pathname = usePathname();

  const getActiveState = (path: string) => {
    return pathname === path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground";
  };

  return (
    <header className="h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b border-border/50 bg-surface z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-3 md:hidden">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Store className="h-5 w-5 text-primary" />
        </div>
        <span className="font-serif font-bold text-xl tracking-tight text-foreground">MohallaMart</span>
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center gap-1 sm:gap-3">
        <div className="mr-2 sm:mr-4">
          <NotificationDropdown />
        </div>
        
        <div className="hidden sm:flex items-center gap-1 bg-muted/20 p-1 rounded-full border border-border/50 mr-2">
          <Link href="/dashboard/orders" className={`p-2 rounded-full transition-colors ${getActiveState("/dashboard/orders")}`} title="Orders">
            <ShoppingBag className="h-5 w-5" />
          </Link>
          <Link href="/dashboard/products" className={`p-2 rounded-full transition-colors ${getActiveState("/dashboard/products")}`} title="Products">
            <Package className="h-5 w-5" />
          </Link>
          <Link href="/dashboard/settings" className={`p-2 rounded-full transition-colors ${getActiveState("/dashboard/settings")}`} title="Settings">
            <Settings className="h-5 w-5" />
          </Link>
        </div>

        <div className="hidden sm:flex">
          <ThemeToggle />
        </div>
        
        <LogoutButton showText={false} className="hidden sm:flex h-10 w-10 p-0 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1" />
      </div>
    </header>
  );
}
