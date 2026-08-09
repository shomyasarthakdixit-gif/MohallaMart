import { ThemeToggle } from "@/components/theme-toggle";
import { Store, Package, ShoppingBag, LayoutDashboard, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";

export default function ShopkeeperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="h-14 flex items-center px-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Shopkeeper Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingBag className="h-5 w-5" /> Orders
          </Link>
          <Link href="/dashboard/products" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Package className="h-5 w-5" /> Products
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-5 w-5" /> Settings
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
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MohallaMart</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            <Link href="/dashboard/orders" className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-primary transition-colors hidden sm:flex">
              <ShoppingBag className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/products" className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-primary transition-colors hidden sm:flex">
              <Package className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/settings" className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-primary transition-colors hidden sm:flex">
              <Settings className="h-5 w-5" />
            </Link>
            <LogoutButton showText={false} className="p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors hidden sm:flex" />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav (simplified for shopkeeper) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur h-16 flex items-center justify-around px-4 pb-safe">
         <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-medium">Dash</span>
        </Link>
        <Link href="/dashboard/orders" className="flex flex-col items-center gap-1 text-muted-foreground">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>
        <Link href="/dashboard/products" className="flex flex-col items-center gap-1 text-muted-foreground">
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-medium">Items</span>
        </Link>
      </nav>
    </div>
  );
}
