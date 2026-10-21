"use client";

import { Clock, Store, Package, Truck, CheckCircle2, Phone } from "lucide-react";

const ORDER_STATES = [
  "PENDING", 
  "ACCEPTED", 
  "PACKING", 
  "READY_FOR_DELIVERY", 
  "OUT_FOR_DELIVERY", 
  "DELIVERED"
];

interface OrderTimelineProps {
  status: string;
  deliveryBoy?: string | null;
  deliveryBoyPhone?: string | null;
}

export function OrderTimeline({ status, deliveryBoy, deliveryBoyPhone }: OrderTimelineProps) {
  const isRejected = status === "REJECTED" || status === "CANCELLED";
  const currentStateIndex = ORDER_STATES.indexOf(status);

  if (isRejected) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4 relative">
          <div className="absolute text-3xl font-bold">✕</div>
        </div>
        <h3 className="text-2xl font-serif font-bold text-destructive">Order {status === "REJECTED" ? "Rejected" : "Cancelled"}</h3>
        <p className="text-muted-foreground">Unfortunately, this order could not be fulfilled.</p>
      </div>
    );
  }

  return (
    <div className="relative py-4 pl-4 sm:pl-0 sm:py-8">
      {/* Vertical line for desktop/mobile */}
      <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-border hidden sm:block"></div>
      
      <div className="space-y-8 relative">
        {[
          { state: "PENDING", title: "Pending Confirmation", desc: "Waiting for shopkeeper to accept", icon: Clock },
          { state: "ACCEPTED", title: "Order Accepted", desc: "The shop has accepted your order", icon: Store },
          { state: "PACKING", title: "Packing", desc: "Your items are being packed", icon: Package },
          { state: "OUT_FOR_DELIVERY", title: "Out for Delivery", desc: "Order is on the way", icon: Truck },
          { state: "DELIVERED", title: "Delivered", desc: "Enjoy your order!", icon: CheckCircle2 },
        ].map((step, idx) => {
          const stepIndex = ORDER_STATES.indexOf(step.state);
          const isCompleted = currentStateIndex >= stepIndex;
          const isCurrent = currentStateIndex === stepIndex;
          
          const Icon = step.icon;
          
          return (
            <div key={step.state} className="flex gap-4 sm:gap-6 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${
                  isCompleted 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-surface border-border text-muted-foreground"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                {idx !== 4 && (
                  <div className={`w-0.5 h-full my-2 transition-colors duration-500 sm:hidden ${isCompleted && currentStateIndex > stepIndex ? 'bg-primary' : 'bg-border'}`}></div>
                )}
              </div>
              
              <div className={`pt-1 pb-6 flex-1 transition-opacity duration-500 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                <h4 className={`font-bold text-lg ${isCurrent ? 'text-primary' : 'text-foreground'}`}>{step.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                
                {/* Delivery Partner Info */}
                {step.state === "OUT_FOR_DELIVERY" && isCompleted && deliveryBoy && (
                  <div className="mt-4 bg-surface border border-border rounded-xl p-4 max-w-sm">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Delivery Partner</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{deliveryBoy}</span>
                      {deliveryBoyPhone && (
                        <a 
                          href={`tel:${deliveryBoyPhone}`}
                          className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-4 py-2 rounded-full font-bold hover:bg-primary/20 transition-colors"
                        >
                          <Phone className="w-4 h-4" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
