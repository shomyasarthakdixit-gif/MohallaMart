"use client";

import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export function LogoutButton({ className, showText = true }: { className?: string, showText?: boolean }) {
  const logout = useAuthStore(state => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <button 
      onClick={handleLogout}
      className={className || "flex w-full items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"}
    >
      <LogOut className="h-5 w-5" />
      {showText && "Logout"}
    </button>
  );
}
