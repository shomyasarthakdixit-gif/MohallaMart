import { Package } from "lucide-react";
import { OrderCard } from "./OrderCard";

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

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  onSelectOrder: (order: Order) => void;
}

export function OrderList({ orders, isLoading, onSelectOrder }: OrderListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 sm:h-24 bg-surface border border-border/30 rounded-[20px] animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-[24px] border border-border/50 border-dashed shadow-sm">
        <div className="p-4 bg-muted/30 rounded-full inline-block mb-4">
          <Package className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-serif font-bold text-foreground">No orders found</h3>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          There are no orders in this category right now.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <OrderCard 
          key={order.id} 
          order={order} 
          onClick={() => onSelectOrder(order)} 
        />
      ))}
    </div>
  );
}
