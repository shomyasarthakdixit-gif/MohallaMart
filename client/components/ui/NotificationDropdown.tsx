"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!user) return [];
      const res = await api.get("/notifications");
      return res.data.notifications;
    },
    refetchInterval: 30000, // Poll every 30 seconds
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await api.put(`/notifications/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const handleNotificationClick = (notification: { id: string; isRead: boolean; link?: string }) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative focus-visible:ring-0 text-foreground hover:bg-muted/50 rounded-full h-10 w-10">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] bg-surface rounded-[20px] shadow-xl border-border/50 p-0 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 bg-muted/10">
          <DropdownMenuLabel className="p-0 font-bold font-serif text-xl tracking-tight text-foreground">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-primary px-3 rounded-full hover:bg-primary/10 font-bold tracking-wide"
              onClick={(e) => {
                e.preventDefault();
                markAllAsReadMutation.mutate();
              }}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="mr-1.5 h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-border/30 m-0" />
        <div className="max-h-[420px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground flex flex-col items-center">
              <div className="h-14 w-14 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 opacity-40" />
              </div>
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="mt-1">You have no new notifications.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {notifications.map((notification: { id: string; isRead: boolean; title: string; createdAt: string; message: string; link?: string }) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-5 cursor-pointer focus:bg-muted/30 transition-colors m-0 rounded-none ${!notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary pl-4' : 'pl-5'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full justify-between items-start mb-1.5 gap-3">
                    <span className={`font-semibold text-sm ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap mt-0.5">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <span className={`text-xs line-clamp-2 leading-relaxed ${!notification.isRead ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}>
                    {notification.message}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
