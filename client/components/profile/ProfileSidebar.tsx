"use client";

import { User, MapPin, Package, Languages, ChevronRight, LogOut, Edit3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export function ProfileSidebar() {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const menuItems = [
    { id: "profile", href: "/profile", icon: User, label: "My Profile", desc: "View account details" },
    { id: "orders", href: "/orders", icon: Package, label: "My Orders", desc: "View past and active orders" },
    { id: "addresses", href: "/profile/addresses", icon: MapPin, label: "Saved Addresses", desc: "Manage delivery locations" },
    { id: "settings", href: "/profile/settings", icon: Languages, label: "Language", desc: "Change language settings" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border/50 rounded-[20px] p-6 sm:p-8 relative overflow-hidden group flex flex-col items-center text-center">
        <div className="absolute top-0 inset-x-0 h-32 bg-primary/5 -z-10" />
        
        <div className="relative mb-6">
          <div className="w-28 h-28 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-500">
            <User className="h-12 w-12" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold font-serif tracking-tight text-foreground">{user?.name || "John Doe"}</h2>
        <p className="text-muted-foreground mt-1 font-medium">{user?.phone || "+91 9876543210"}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
          Verified User
        </div>
      </div>

      <div className="bg-surface border border-border/50 rounded-[20px] overflow-hidden flex flex-col divide-y divide-border/30">
        {menuItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.id}
              href={item.href}
              className={`flex items-center text-left p-4 sm:p-5 transition-colors ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-primary/5 border-l-4 border-transparent'}`}
            >
              <div className={`p-2.5 rounded-[12px] mr-4 transition-colors ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className={`font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
              <ChevronRight className={`h-5 w-5 transition-transform ${isActive ? 'text-primary translate-x-1' : 'text-muted-foreground/50'}`} />
            </Link>
          );
        })}
      </div>

      <Button 
        variant="ghost" 
        className="w-full text-red-600 hover:bg-red-600/10 hover:text-red-700 flex items-center justify-center gap-2 h-14 rounded-[16px] font-medium"
        onClick={handleLogout}
      >
        <LogOut className="h-5 w-5" /> Log Out
      </Button>
    </div>
  );
}
