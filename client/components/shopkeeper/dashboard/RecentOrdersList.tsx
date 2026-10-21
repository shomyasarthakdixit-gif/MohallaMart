import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  product: { name: string };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

interface RecentOrdersListProps {
  orders: Order[];
  isLoading: boolean;
}

export function RecentOrdersList({ orders, isLoading }: RecentOrdersListProps) {
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "PENDING": return <Clock className="h-4 w-4 text-amber-500" />;
      case "ACCEPTED": 
      case "PACKING": return <Package className="h-4 w-4 text-blue-500" />;
      case "READY_FOR_DELIVERY": return <Package className="h-4 w-4 text-indigo-500" />;
      case "OUT_FOR_DELIVERY": return <Truck className="h-4 w-4 text-orange-500" />;
      case "DELIVERED": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "REJECTED":
      case "CANCELLED": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PENDING": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "ACCEPTED": 
      case "PACKING": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "READY_FOR_DELIVERY": return "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
      case "OUT_FOR_DELIVERY": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "DELIVERED": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "REJECTED":
      case "CANCELLED": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-transparent";
    }
  };

  return (
    <Card className="bg-surface border-border/50 rounded-[20px] shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30 bg-muted/5">
        <CardTitle className="font-serif text-xl tracking-tight text-foreground">Recent Orders</CardTitle>
        <Link href="/dashboard/orders" className="text-sm font-bold text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="p-4 bg-muted/30 rounded-full mb-4">
              <Package className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="font-bold text-foreground">No recent orders</p>
            <p className="text-sm text-muted-foreground mt-1">Orders will appear here as they come in.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {orders.slice(0, 5).map(order => (
              <Link key={order.id} href="/dashboard/orders" className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/5 transition-colors group block">
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex h-12 w-12 rounded-full bg-muted/30 items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <div className="font-bold text-foreground mb-1">
                      Order #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {order.items.length} items • ₹{order.totalAmount}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block text-xs text-muted-foreground font-medium">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status.replace(/_/g, " ")}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
