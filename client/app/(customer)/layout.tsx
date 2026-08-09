import { ThemeToggle } from "@/components/theme-toggle";
import { Store, ShoppingCart, User, Package } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { GlobalCartDrawer } from "@/components/GlobalCartDrawer";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { SearchBar } from "@/components/ui/SearchBar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="h-14 flex items-center px-4 border-b">
          <Link href="/home" className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MohallaMart</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          <Link href="/home" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Store className="h-5 w-5" /> Home
          </Link>
          <Link href="/orders" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Package className="h-5 w-5" /> Orders
          </Link>
          <Link href="/cart" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="h-5 w-5" /> Cart
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" /> Profile
          </Link>
        </nav>

        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 flex items-center justify-between border-b px-4 bg-background z-10 sticky top-0">
          <Link href="/home" className="flex items-center gap-2 md:hidden">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">MohallaMart</span>
          </Link>
          
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>
          
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            <Link href="/cart" className="p-2 hover:bg-accent rounded-full relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                0
              </span>
            </Link>
            <Link href="/orders" className="p-2 hover:bg-accent rounded-full hidden sm:flex text-muted-foreground hover:text-primary transition-colors">
              <Package className="h-5 w-5" />
            </Link>
            <Link href="/profile" className="p-2 hover:bg-accent rounded-full hidden sm:flex text-muted-foreground hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <LogoutButton showText={false} className="p-2 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors hidden sm:flex" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <GlobalCartDrawer />

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur h-16 flex items-center justify-around px-2 pb-safe">
        <Link href="/home" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary">
          <Store className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary">
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
        <LogoutButton showText={false} className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-destructive" />
      </nav>
    </div>
  );
}
