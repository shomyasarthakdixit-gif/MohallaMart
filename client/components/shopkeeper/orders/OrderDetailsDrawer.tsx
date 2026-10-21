import { useState } from "react";
import { X, Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

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

interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (id: string, status: string, name?: string, phone?: string) => void;
  isUpdating: boolean;
}

export function OrderDetailsDrawer({ isOpen, onClose, order, onUpdateStatus, isUpdating }: OrderDetailsDrawerProps) {
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryBoyName, setDeliveryBoyName] = useState("");
  const [deliveryBoyPhone, setDeliveryBoyPhone] = useState("");

  const handleClose = () => {
    setShowDeliveryForm(false);
    setDeliveryBoyName("");
    setDeliveryBoyPhone("");
    onClose();
  };

  if (!order) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40" 
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-2xl border-l border-border/50 z-50 flex flex-col"
          >
            <div className="p-4 sm:p-6 border-b border-border/30 flex items-center justify-between bg-muted/5">
              <div>
                <h2 className="text-xl font-serif font-bold text-foreground">Order Details</h2>
                <p className="text-sm font-medium text-muted-foreground mt-1">#{order.id.slice(-6).toUpperCase()}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full hover:bg-muted h-10 w-10">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              <div className="bg-muted/10 p-5 rounded-2xl border border-border/30 space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Customer Info</h3>
                  <div className="font-bold text-foreground">{order.user?.name || "Anonymous"}</div>
                  <div className="text-sm text-muted-foreground font-medium">{order.user?.phone || "No phone provided"}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                  <div>
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Delivery</h3>
                    <div className="text-xs bg-muted/30 text-foreground border border-border/50 inline-block px-2.5 py-1 rounded-md font-bold">
                      {order.deliveryType}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment</h3>
                    {order.payment ? (
                      <div className={`text-xs inline-block px-2.5 py-1 rounded-md font-bold border ${order.payment.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : order.payment.status === 'REFUNDED' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                        {order.payment.method} • {order.payment.status}
                      </div>
                    ) : (
                      <div className="text-xs bg-muted/30 text-muted-foreground border border-border/50 inline-block px-2.5 py-1 rounded-md font-bold">
                        PENDING
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Order Items</h3>
                <div className="space-y-3 divide-y divide-border/30 bg-surface rounded-2xl border border-border/50 p-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start pt-3 first:pt-0">
                      <div>
                        <div className="font-bold text-foreground leading-tight">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground font-medium mt-1">Qty: {item.quantity} × ₹{item.price}</div>
                      </div>
                      <div className="font-bold text-right text-foreground">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 space-y-3">
                <div className="flex justify-between text-sm text-foreground font-medium">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="flex justify-between text-sm text-foreground font-medium">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹{order.totalAmount - order.items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="pt-3 border-t border-primary/10 mt-3 flex justify-between font-serif font-bold text-2xl text-primary">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 sm:p-6 border-t border-border/30 bg-surface space-y-4 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Update Status</h3>
              
              {order.status === "PENDING" && (
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 font-bold shadow-md h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground" 
                    onClick={() => onUpdateStatus(order.id, "ACCEPTED")}
                    disabled={isUpdating}
                  >
                    Accept Order
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1 font-bold shadow-md h-12 rounded-xl"
                    onClick={() => onUpdateStatus(order.id, "REJECTED")}
                    disabled={isUpdating}
                  >
                    Reject
                  </Button>
                </div>
              )}

              {order.status === "ACCEPTED" && (
                <Button 
                  className="w-full font-bold shadow-md h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => onUpdateStatus(order.id, "PACKING")}
                  disabled={isUpdating}
                >
                  Start Packing
                </Button>
              )}

              {order.status === "PACKING" && (
                <Button 
                  className="w-full font-bold shadow-md h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white" 
                  onClick={() => onUpdateStatus(order.id, "READY_FOR_DELIVERY")}
                  disabled={isUpdating}
                >
                  Mark Ready for Delivery
                </Button>
              )}

              {order.status === "READY_FOR_DELIVERY" && !showDeliveryForm && (
                <Button 
                  className="w-full font-bold shadow-md h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white" 
                  onClick={() => setShowDeliveryForm(true)}
                  disabled={isUpdating}
                >
                  Mark Out for Delivery
                </Button>
              )}

              {order.status === "READY_FOR_DELIVERY" && showDeliveryForm && (
                <div className="space-y-4 bg-muted/10 p-5 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-sm">Assign Delivery Partner</h4>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Delivery Boy Name" 
                      className="h-12 bg-surface rounded-xl border-border/50"
                      value={deliveryBoyName} 
                      onChange={e => setDeliveryBoyName(e.target.value)} 
                    />
                    <Input 
                      placeholder="Phone Number (optional)" 
                      className="h-12 bg-surface rounded-xl border-border/50"
                      value={deliveryBoyPhone} 
                      onChange={e => setDeliveryBoyPhone(e.target.value)} 
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold border-border/50" onClick={() => setShowDeliveryForm(false)}>Cancel</Button>
                    <Button 
                      className="flex-1 font-bold shadow-md h-12 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                      disabled={!deliveryBoyName || isUpdating}
                      onClick={() => {
                        onUpdateStatus(order.id, "OUT_FOR_DELIVERY", deliveryBoyName, deliveryBoyPhone);
                        setShowDeliveryForm(false);
                      }}
                    >
                      Confirm Out
                    </Button>
                  </div>
                </div>
              )}

              {order.status === "OUT_FOR_DELIVERY" && (
                <Button 
                  className="w-full font-bold shadow-md h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={() => onUpdateStatus(order.id, "DELIVERED")}
                  disabled={isUpdating}
                >
                  Mark Delivered
                </Button>
              )}

              {["DELIVERED", "REJECTED", "CANCELLED"].includes(order.status) && (
                <div className="text-center p-4 bg-muted/20 rounded-xl font-bold text-muted-foreground border border-border/30 uppercase tracking-wider text-sm">
                  Order is {order.status.toLowerCase()}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
