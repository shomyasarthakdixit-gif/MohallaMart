"use client";

import { Clock, Zap } from "lucide-react";

interface DeliverySelectorProps {
  deliveryType: "SCHEDULED" | "EXPRESS";
  setDeliveryType: (type: "SCHEDULED" | "EXPRESS") => void;
  totalScheduledFee: number;
  totalExpressFee: number;
}

export function DeliverySelector({ deliveryType, setDeliveryType, totalScheduledFee, totalExpressFee }: DeliverySelectorProps) {
  return (
    <div className="space-y-3">
      <label 
        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
          deliveryType === "SCHEDULED" 
            ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm" 
            : "border-border hover:bg-muted/30"
        }`}
      >
        <input 
          type="radio" 
          name="delivery" 
          className="mt-1"
          checked={deliveryType === "SCHEDULED"}
          onChange={() => setDeliveryType("SCHEDULED")}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Clock className="h-4 w-4 text-primary" /> Standard Delivery
          </div>
          <p className="text-sm text-muted-foreground mt-1">Delivered between 8 PM - 10 PM. Applied per shop.</p>
        </div>
        <div className="font-extrabold text-foreground">₹{totalScheduledFee} total</div>
      </label>

      <label 
        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
          deliveryType === "EXPRESS" 
            ? "border-accent bg-accent/5 ring-1 ring-accent/20 shadow-sm" 
            : "border-border hover:bg-muted/30"
        }`}
      >
        <input 
          type="radio" 
          name="delivery" 
          className="mt-1"
          checked={deliveryType === "EXPRESS"}
          onChange={() => setDeliveryType("EXPRESS")}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Zap className="h-4 w-4 text-accent" /> Express Delivery
          </div>
          <p className="text-sm text-muted-foreground mt-1">Delivered within 30-45 minutes. Applied per shop.</p>
        </div>
        <div className="font-extrabold text-foreground">₹{totalExpressFee} total</div>
      </label>
    </div>
  );
}
