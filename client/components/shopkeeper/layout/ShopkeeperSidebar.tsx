"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, Package, ShoppingBag, LayoutDashboard, Settings } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export function ShopkeeperSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/orders", icon: ShoppingBag, label: "Orders" },
    { href: "/dashboard/products", icon: Package, label: "Products" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-surface border-r border-border/50 shadow-sm z-20 sticky top-0 h-screen">
      <div className="h-20 flex items-center px-6 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-foreground">MohallaMart</span>
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border/50 mt-auto bg-muted/10">
        <LogoutButton className="w-full justify-start rounded-[12px] hover:bg-destructive hover:text-destructive-foreground text-muted-foreground hover:border-destructive transition-colors" showText={true} />
      </div>
    </aside>
  );
}
