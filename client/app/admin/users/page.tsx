"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { User } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data.users as UserData[];
    }
  });

  if (isLoading) {
    return <div className="p-4 text-center mt-20 text-muted-foreground font-medium">Loading users...</div>;
  }

  const columns = [
    {
      header: "User Details",
      cell: (user: UserData) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-foreground">{user.name}</div>
            <div className="text-muted-foreground text-xs">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user: UserData) => <AdminStatusBadge status={user.role} />
    },
    {
      header: "Joined Date",
      cell: (user: UserData) => (
        <span className="text-muted-foreground font-medium">
          {format(new Date(user.createdAt), "MMM d, yyyy")}
        </span>
      )
    }
  ];

  const searchFn = (user: UserData, query: string) => {
    const q = query.toLowerCase();
    return user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AdminPageHeader 
        title="Platform Users" 
        description="Manage all registered users across the platform."
      />
      <AdminTable 
        columns={columns} 
        data={users} 
        searchPlaceholder="Search users by name or email..." 
        searchFn={searchFn}
        emptyMessage="No users found matching your criteria."
      />
    </div>
  );
}
