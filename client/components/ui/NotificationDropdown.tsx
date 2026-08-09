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

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

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

  const handleNotificationClick = (notification: any) => {
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
        <Button variant="ghost" size="icon" className="relative focus-visible:ring-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-background/95 backdrop-blur-sm border-border/50">
        <div className="flex justify-between items-center px-4 py-2">
          <DropdownMenuLabel className="p-0 font-bold text-lg">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-primary px-2"
              onClick={(e) => {
                e.preventDefault();
                markAllAsReadMutation.mutate();
              }}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="bg-border/30" />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-3 opacity-20" />
              <p>You don't have any notifications yet.</p>
            </div>
          ) : (
            notifications.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-4 cursor-pointer focus:bg-muted/50 border-b border-border/20 last:border-0 ${!notification.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex w-full justify-between items-start mb-1 gap-2">
                  <span className={`font-semibold text-sm ${!notification.isRead ? 'text-primary' : 'text-foreground/90'}`}>
                    {notification.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {notification.message}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
