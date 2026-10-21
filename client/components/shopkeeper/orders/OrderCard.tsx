import { Package, Clock, CheckCircle2, Truck, XCircle, ChevronRight } from "lucide-react";
import { format } from "date-fns";

interface OrderItem {
  quantity: number;
  price: number;
  product: { name: string };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  deliveryType: string;
  createdAt: string;
  user: { name: string; phone: string };
  items: OrderItem[];
  payment?: {
    method: string;
    status: string;
  };
}

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

export function OrderCard({ order, onClick }: OrderCardProps) {
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
    <div 
      className="group bg-surface border border-border/50 rounded-[20px] p-5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row gap-4 justify-between sm:items-center"
      onClick={onClick}
    >
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
            Order #{order.id.slice(-6).toUpperCase()}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {order.status.replace(/_/g, " ")}
          </span>
          {order.deliveryType === "EXPRESS" && (
            <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-md">
              Express
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 flex-wrap">
          <span>{format(new Date(order.createdAt), "MMM d, h:mm a")}</span>
          <span>•</span>
          <span>{order.user?.name || "Customer"}</span>
          <span>•</span>
          <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-border/30 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
        <div className="text-left sm:text-right">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Total</p>
          <p className="font-serif font-bold text-xl text-foreground">₹{order.totalAmount}</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </div>
  );
}
