"use client";

import { Clock, Package, Truck, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string | null;
  };
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shop: { name: string; id?: string };
  items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
}

export const getStatusDetails = (status: string) => {
  switch (status) {
    case "PENDING": 
      return { icon: <Clock className="h-4 w-4 text-amber-500" />, color: "bg-amber-500/10 text-amber-700 border-amber-500/20", label: "Pending" };
    case "ACCEPTED": 
    case "PACKING": 
      return { icon: <Package className="h-4 w-4 text-blue-500" />, color: "bg-blue-500/10 text-blue-700 border-blue-500/20", label: status === "ACCEPTED" ? "Accepted" : "Packing" };
    case "READY_FOR_DELIVERY": 
      return { icon: <Package className="h-4 w-4 text-indigo-500" />, color: "bg-indigo-500/10 text-indigo-700 border-indigo-500/20", label: "Ready" };
    case "OUT_FOR_DELIVERY": 
      return { icon: <Truck className="h-4 w-4 text-orange-500" />, color: "bg-orange-500/10 text-orange-700 border-orange-500/20", label: "Out for Delivery" };
    case "DELIVERED": 
      return { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", label: "Delivered" };
    case "REJECTED":
    case "CANCELLED": 
      return { icon: <XCircle className="h-4 w-4 text-destructive" />, color: "bg-destructive/10 text-destructive border-destructive/20", label: status === "REJECTED" ? "Rejected" : "Cancelled" };
    default: 
      return { icon: <Clock className="h-4 w-4 text-muted-foreground" />, color: "bg-muted text-muted-foreground border-border", label: status };
  }
};

export function OrderCard({ order }: OrderCardProps) {
  const statusDetails = getStatusDetails(order.status);

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-surface border border-border hover:border-primary/40 transition-colors cursor-pointer group shadow-sm hover:shadow-md rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-between items-start sm:items-center">
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-start justify-between sm:justify-start sm:gap-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
                </p>
                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{order.shop.name}</h3>
              </div>
              
              {/* Mobile status */}
              <div className="sm:hidden">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusDetails.color}`}>
                  {statusDetails.icon}
                  {statusDetails.label}
                </span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground line-clamp-1">
              {order.items.map(item => `${item.quantity}x ${item.product.name}`).join(", ")}
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 border-t border-border/50 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
            {/* Desktop status */}
            <div className="hidden sm:block">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusDetails.color}`}>
                {statusDetails.icon}
                {statusDetails.label}
              </span>
            </div>
            
            <div className="text-left sm:text-right">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Total</p>
              <p className="text-xl font-extrabold text-foreground">₹{order.totalAmount}</p>
            </div>
            
            <div className="hidden sm:flex h-10 w-10 bg-primary/10 rounded-full items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
