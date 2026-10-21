"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { Store, ShoppingCart, User, Package } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { GlobalCartDrawer } from "@/components/GlobalCartDrawer";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { AIAssistantWidget } from "@/components/AIAssistantWidget";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const { user, isLoading, hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (hasHydrated && !isLoading && (!user || user.role !== "CUSTOMER")) {
      router.replace("/");
    }
  }, [user, isLoading, hasHydrated, router]);

  if (!hasHydrated || (!user || user.role !== "CUSTOMER")) {
    return null; // prevent flashing while redirecting
  }

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-surface">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/home" className="flex items-center gap-2">
            <Store className="h-7 w-7 text-primary" />
            <span className="font-serif font-bold text-2xl text-foreground">MohallaMart</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <Link href="/home" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors">
            <Store className="h-5 w-5" /> {t("home")}
          </Link>
          <Link href="/orders" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
            <Package className="h-5 w-5" /> {t("orders")}
          </Link>
          <Link href="/cart" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
            <ShoppingCart className="h-5 w-5" /> {t("cart")}
          </Link>
          <Link href="/profile" className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
            <User className="h-5 w-5" /> {t("profile")}
          </Link>
        </nav>

        <div className="p-6 border-t border-border">
          <LogoutButton className="w-full justify-start rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" />
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Navigation */}
        <header className="h-16 flex items-center justify-between border-b border-border px-4 sm:px-6 bg-surface/90 backdrop-blur-md z-10 sticky top-0">
          <Link href="/home" className="flex items-center gap-2 md:hidden">
            <Store className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-xl text-foreground">MohallaMart</span>
          </Link>
          
          {/* Spacer to push icons to the right on desktop */}
          <div className="flex-1 hidden md:block"></div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 ml-auto">
            <NotificationDropdown />
            <Link href="/cart" className="p-2.5 hover:bg-muted rounded-full relative transition-colors">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border border-surface">
                0
              </span>
            </Link>
            <Link href="/orders" className="p-2.5 hover:bg-muted rounded-full hidden sm:flex text-muted-foreground hover:text-foreground transition-colors">
              <Package className="h-5 w-5" />
            </Link>
            <Link href="/profile" className="p-2.5 hover:bg-muted rounded-full hidden sm:flex text-muted-foreground hover:text-foreground transition-colors">
              <User className="h-5 w-5" />
            </Link>
            <LogoutButton showText={false} className="p-2.5 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive transition-colors hidden sm:flex" />
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <GlobalCartDrawer />
      <AIAssistantWidget />

      {/* Mobile Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface h-16 flex items-center justify-around px-2 pb-safe">
        <Link href="/home" className="flex flex-col items-center justify-center w-12 h-12 gap-1 text-primary">
          <Store className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t("home")}</span>
        </Link>
        <Link href="/orders" className="flex flex-col items-center justify-center w-12 h-12 gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t("orders")}</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center justify-center w-12 h-12 gap-1 text-muted-foreground hover:text-foreground transition-colors relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t("cart")}</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center justify-center w-12 h-12 gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">{t("profile")}</span>
        </Link>
      </nav>
    </div>
  );
}
