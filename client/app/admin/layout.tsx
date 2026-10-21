"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Users, Store, ShoppingBag, LayoutDashboard, Settings, LogOut, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hasHydrated && !isLoading && (!user || user.role !== "ADMIN")) {
      router.replace("/");
    }
  }, [user, isLoading, hasHydrated, router]);

  if (!hasHydrated || (!user || user.role !== "ADMIN")) {
    return null; // prevent flashing
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="h-14 flex items-center px-4 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-xl">Platform Ops</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${pathname === '/admin/dashboard' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/admin/users" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${pathname === '/admin/users' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <Users className="h-5 w-5" /> Users
          </Link>
          <Link href="/admin/shops" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${pathname === '/admin/shops' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <Store className="h-5 w-5" /> Shops
          </Link>
          <Link href="/admin/orders" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${pathname === '/admin/orders' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
            <ShoppingBag className="h-5 w-5" /> Global Orders
          </Link>
        </nav>

        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 flex items-center justify-between border-b px-4 bg-background z-10 sticky top-0">
          <div className="flex items-center gap-2 md:hidden">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span className="font-serif font-bold text-lg">Platform Ops</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            <LogoutButton showText={false} className="p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors hidden sm:flex" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/10 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur h-16 flex items-center justify-around px-4 pb-safe">
         <Link href="/admin/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/admin/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Dash</span>
        </Link>
        <Link href="/admin/users" className={`flex flex-col items-center gap-1 ${pathname === '/admin/users' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Users className="h-5 w-5" />
          <span className="text-[10px] font-medium">Users</span>
        </Link>
        <Link href="/admin/shops" className={`flex flex-col items-center gap-1 ${pathname === '/admin/shops' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Store className="h-5 w-5" />
          <span className="text-[10px] font-medium">Shops</span>
        </Link>
        <Link href="/admin/orders" className={`flex flex-col items-center gap-1 ${pathname === '/admin/orders' ? 'text-primary' : 'text-muted-foreground'}`}>
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>
      </nav>
    </div>
  );
}
